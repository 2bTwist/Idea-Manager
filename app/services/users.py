import hashlib, secrets
from datetime import datetime, timedelta, timezone
from app.models.password_reset import PasswordResetToken
from app.models.email_verification import EmailVerificationToken
from app.services.email import send_email
from app.core.config import settings

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
import sqlalchemy as sa
from app.models.user import User
from app.core.security import get_password_hash, verify_password
from typing import Sequence
from uuid import UUID

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

async def list_users(
    db: AsyncSession,
    *,
    limit: int = 20,
    offset: int = 0,
    q: str | None = None,
    is_active: bool | None = None,
) -> tuple[list[User], int]:
    filters = []
    if q:
        like = f"%{q.lower()}%"
        filters.append(sa.or_(User.email.ilike(like), User.full_name.ilike(like)))
    if is_active is not None:
        filters.append(User.is_active.is_(is_active))

    stmt = select(User).where(*filters).order_by(User.created_at.desc()).limit(limit).offset(offset)
    rows = (await db.execute(stmt)).scalars().all()

    count_stmt = select(func.count()).select_from(select(User.id).where(*filters).subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    return rows, total

async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User | None:
    res = await db.execute(select(User).where(User.id == user_id))
    return res.scalar_one_or_none()

async def update_user_admin(db: AsyncSession, user_id: UUID, data: dict) -> User | None:
    user = await get_user_by_id(db, user_id)
    if not user:
        return None
    for k, v in data.items():
        if v is not None:
            setattr(user, k, v)
    await db.commit()
    await db.refresh(user)
    return user

async def delete_user(db: AsyncSession, user_id: UUID) -> bool:
    user = await get_user_by_id(db, user_id)
    if not user:
        return False
    await db.delete(user)
    await db.commit()
    return True

async def set_user_password(db: AsyncSession, user: User, new_password: str) -> User:
    user.hashed_password = get_password_hash(new_password)
    await db.commit()
    await db.refresh(user)
    return user

async def update_profile(db: AsyncSession, user: User, *, full_name: str | None = None) -> User:
    if full_name is not None:
        user.full_name = full_name
    await db.commit()
    await db.refresh(user)
    return user

async def change_password(
    db: AsyncSession, *, user_id: UUID, current_password: str, new_password: str
) -> bool:
    user = await get_user_by_id(db, user_id)
    if not user:
        return False
    if not verify_password(current_password, user.hashed_password):
        return False
    user.hashed_password = get_password_hash(new_password)
    await db.commit()
    return True

def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

async def create_password_reset_token(db: AsyncSession, *, email: str, ttl_minutes: int = 30) -> str | None:
    user = await get_by_email(db, email.lower().strip())
    if not user or not user.is_active:
        # Do NOT reveal whether the email exists.
        return None

    raw = secrets.token_urlsafe(48)  # send to user
    hashed = _hash_token(raw)
    expires = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)

    prt = PasswordResetToken(user_id=user.id, token_hash=hashed, expires_at=expires)
    db.add(prt)
    await db.commit()
    return raw

async def reset_password_with_token(db: AsyncSession, *, token: str, new_password: str) -> bool:
    hashed = _hash_token(token)
    now = datetime.now(timezone.utc)

    res = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == hashed,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
    )
    prt = res.scalar_one_or_none()
    if not prt:
        return False

    user = await get_user_by_id(db, prt.user_id)
    if not user or not user.is_active:
        return False

    user.hashed_password = get_password_hash(new_password)
    prt.used_at = now
    await db.commit()
    return True

def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def _abs_link(path_and_query: str) -> str:
    base = settings.EXTERNAL_BASE_URL.rstrip("/")
    suffix = path_and_query if path_and_query.startswith("/") else f"/{path_and_query}"
    return f"{base}{suffix}"

async def issue_email_verification(db: AsyncSession, user: User, ttl_minutes: int = 60) -> str:
    raw = secrets.token_urlsafe(48)
    hashed = _hash_token(raw)
    expires = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)

    token = EmailVerificationToken(user_id=user.id, token_hash=hashed, expires_at=expires)
    db.add(token)
    await db.commit()

    verify_link = _abs_link(f"/auth/verify-email?token={raw}")

    html = f"""
    <p>Hello {user.full_name or user.email},</p>
    <p>Confirm your email for <b>Idea Manager</b>:</p>
    <p><a href="{verify_link}">Verify my email</a></p>
    <p>This link expires in {ttl_minutes} minutes. If you didn’t create an account, you can ignore this.</p>
    """
    send_email(user.email, "Verify your email", html)
    return raw  # returned only for dev tests

async def verify_email_with_token(db: AsyncSession, token_raw: str) -> bool:
    hashed = _hash_token(token_raw)
    now = datetime.now(timezone.utc)
    res = await db.execute(
        select(EmailVerificationToken).where(
            EmailVerificationToken.token_hash == hashed,
            EmailVerificationToken.used_at.is_(None),
            EmailVerificationToken.expires_at > now,
        )
    )
    evt = res.scalar_one_or_none()
    if not evt:
        return False

    user = await get_user_by_id(db, evt.user_id)
    if not user or not user.is_active:
        return False

    user.is_verified = True
    evt.used_at = now
    await db.commit()
    return True

async def send_password_reset_email(db: AsyncSession, *, email: str, ttl_minutes: int = 30) -> None:
    """
    Creates a reset token (if the account exists & active) and sends an email.
    Always silent about existence to the caller.
    """
    token = await create_password_reset_token(db, email=email, ttl_minutes=ttl_minutes)
    if not token:
        return  # don't reveal anything

    reset_link = _abs_link(f"/auth/reset-password?token={token}")
    html = f"""
    <p>Hello,</p>
    <p>You requested a password reset for <b>Idea Manager</b>.</p>
    <p><a href="{reset_link}">Reset my password</a></p>
    <p>This link expires in {ttl_minutes} minutes. If you didn’t request this, you can ignore it.</p>
    """
    send_email(email, "Reset your password", html)
