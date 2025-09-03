from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import SessionLocal

from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.schemas.user import TokenData
from app.models.user import User
from sqlalchemy import select
from uuid import UUID

# Make the OAuth2 dependency non-fatal so we can fall back to cookie-based sessions.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session

async def get_bearer_or_cookie_token(
    token: str | None = Depends(oauth2_scheme),
    cookie_token: str | None = Cookie(default=None, alias=settings.COOKIE_SESSION_NAME),
) -> str:
    # Prefer Authorization header; if missing, use cookie
    # oauth2_scheme now returns None instead of raising; fall back to cookie.
    raw = token or cookie_token
    # Return empty string if nothing present; caller (get_current_user) will raise a credentials error.
    return raw or ""

async def get_current_user(
    raw_token: str = Depends(get_bearer_or_cookie_token),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(raw_token, settings.SECRET_KEY, algorithms=[settings.ACCESS_TOKEN_ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exc
        user_id = UUID(sub)
    except (JWTError, ValueError):
        raise credentials_exc
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if user is None:
        raise credentials_exc
    return user

async def require_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return current_user

async def require_verified(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified")
    return current_user
