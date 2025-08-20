from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func 
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
