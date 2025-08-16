from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.security import get_password_hash, verify_password

async def get_by_email(db: AsyncSession, email: str) -> User | None:
    res = await db.execute(select(User).where(User.email == email))
    return res.scalar_one_or_none()

async def create_user(db: AsyncSession, *, email: str, password: str, full_name: str | None = None) -> User:
    user = User(email=email.lower().strip(), hashed_password=get_password_hash(password), full_name=full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def authenticate(db: AsyncSession, *, email: str, password: str) -> User | None:
    user = await get_by_email(db, email.lower().strip())
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
