from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.idea import Idea

async def create(db: AsyncSession, data: dict) -> Idea:
    obj = Idea(**data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj

async def get(db: AsyncSession, idea_id: str) -> Idea | None:
    res = await db.execute(select(Idea).where(Idea.id == idea_id))
    return res.scalar_one_or_none()

async def list_(db: AsyncSession, limit: int = 20, offset: int = 0) -> list[Idea]:
    res = await db.execute(
        select(Idea).order_by(Idea.created_at.desc()).limit(limit).offset(offset)
    )
    return res.scalars().all()

async def update_(db: AsyncSession, idea_id: str, data: dict) -> Idea | None:
    res = await db.execute(select(Idea).where(Idea.id == idea_id))
    obj = res.scalar_one_or_none()
    if not obj:
        return None
    for k, v in data.items():
        if v is not None:
            setattr(obj, k, v)
    await db.commit()
    await db.refresh(obj)
    return obj

async def delete_(db: AsyncSession, idea_id: str) -> bool:
    res = await db.execute(select(Idea).where(Idea.id == idea_id))
    obj = res.scalar_one_or_none()
    if not obj:
        return False
    await db.delete(obj)
    await db.commit()
    return True
