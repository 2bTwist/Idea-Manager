import sqlalchemy as sa
from typing import Sequence
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import selectinload
from app.models.idea import Idea
from uuid import UUID    

def _build_filters(q: str | None, uses_ai: bool | None, min_score: float | None, max_score: float | None, owner_id: UUID, tags_any: Sequence[str] | None):
    filters = []
    filters.append(Idea.owner_id == owner_id)

    if q:
        like = f"%{q}%"
        filters.append(sa.or_(Idea.title.ilike(like), Idea.description.ilike(like)))
    if uses_ai is not None:
        filters.append(Idea.uses_ai.is_(uses_ai))
    if min_score is not None:
        filters.append(Idea.score >= min_score)
    if max_score is not None:
        filters.append(Idea.score <= max_score)
    if tags_any:  # NEW: overlap (ANY of these tags)
        filters.append(Idea.tags.op("&&")(sa.cast(tags_any, ARRAY(sa.String()))))
    return filters

async def create(db: AsyncSession, data: dict, *, owner_id: UUID) -> Idea:
    data = {**data, "owner_id": owner_id}
    obj = Idea(**data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj, attribute_names=["owner"])
    return obj

async def get(db: AsyncSession, idea_id: str, *, owner_id: UUID) -> Idea | None:
    try:
        iid = UUID(idea_id)
    except ValueError:
        return None
    res = await db.execute(select(Idea).options(selectinload(Idea.owner)).where(Idea.id == iid, Idea.owner_id == owner_id))

    return res.scalar_one_or_none()

async def list_(
    db: AsyncSession,
    limit: int = 20,
    offset: int = 0,
    sort: str = "created_at",      # "created_at" | "score"
    order: str = "desc",           # "asc" | "desc"
    q: str | None = None,
    uses_ai: bool | None = None,
    min_score: float | None = None,
    max_score: float | None = None,
    *,
    owner_id: UUID,
    tags_any: Sequence[str] | None = None
):
    filters = _build_filters(q, uses_ai, min_score, max_score, owner_id, tags_any)

    sort_map = {"created_at": Idea.created_at, "score": Idea.score}
    sort_col = sort_map.get(sort, Idea.created_at)
    order_by = sort_col.desc() if order.lower() == "desc" else sort_col.asc()

    # rows
    stmt = select(Idea).options(selectinload(Idea.owner)).where(*filters).order_by(order_by).limit(limit).offset(offset)
    rows = (await db.execute(stmt)).scalars().all()

    # total (same filters, no limit/offset)
    count_stmt = select(func.count()).select_from(select(Idea.id).where(*filters).subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    return rows, total

async def update_(db: AsyncSession, idea_id: str, data: dict, *, owner_id: UUID) -> Idea | None:
    try:
        iid = UUID(idea_id)
    except ValueError:
        return None
    res = await db.execute(select(Idea).where(Idea.id == iid, Idea.owner_id == owner_id))

    obj = res.scalar_one_or_none()
    if not obj:
        return None
    for k, v in data.items():
        if v is not None:
            setattr(obj, k, v)
    await db.commit()
    await db.refresh(obj)
    await db.refresh(obj, attribute_names=["owner"]) 
    return obj

async def delete_(db: AsyncSession, idea_id: str, *, owner_id: UUID) -> bool:
    try:
        iid = UUID(idea_id)
    except ValueError:
        return False
    res = await db.execute(select(Idea).where(Idea.id == iid, Idea.owner_id == owner_id))
    
    obj = res.scalar_one_or_none()
    if not obj:
        return False
    await db.delete(obj)
    await db.commit()
    return True 

# Convenience helpers (add/remove) – purely in DB
async def add_tags(db: AsyncSession, idea_id: str, tags: Sequence[str], *, owner_id: UUID) -> Idea | None:
    obj = await get(db, idea_id, owner_id=owner_id)
    if not obj:
        return None
    current = set(obj.tags or [])
    newset = sorted(current.union(tags))
    obj.tags = newset
    await db.commit()
    await db.refresh(obj)
    await db.refresh(obj, attribute_names=["owner"])
    return obj

async def remove_tags(db: AsyncSession, idea_id: str, tags: Sequence[str], *, owner_id: UUID) -> Idea | None:
    obj = await get(db, idea_id, owner_id=owner_id)
    if not obj:
        return None
    current = set(obj.tags or [])
    newset = sorted(current.difference(tags))
    obj.tags = newset
    await db.commit()
    await db.refresh(obj)
    await db.refresh(obj, attribute_names=["owner"])
    return obj