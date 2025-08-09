import sqlalchemy as sa
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.idea import Idea    

def _build_filters(q: str | None, uses_ai: bool | None, min_score: float | None, max_score: float | None):
    filters = []
    if q:
        like = f"%{q}%"
        filters.append(sa.or_(Idea.title.ilike(like), Idea.description.ilike(like)))
    if uses_ai is not None:
        filters.append(Idea.uses_ai.is_(uses_ai))
    if min_score is not None:
        filters.append(Idea.score >= min_score)
    if max_score is not None:
        filters.append(Idea.score <= max_score)
    return filters

async def create(db: AsyncSession, data: dict) -> Idea:
    obj = Idea(**data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj

async def get(db: AsyncSession, idea_id: str) -> Idea | None:
    res = await db.execute(select(Idea).where(Idea.id == idea_id))
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
):
    filters = _build_filters(q, uses_ai, min_score, max_score)

    sort_map = {"created_at": Idea.created_at, "score": Idea.score}
    sort_col = sort_map.get(sort, Idea.created_at)
    order_by = sort_col.desc() if order.lower() == "desc" else sort_col.asc()

    # rows
    stmt = select(Idea).where(*filters).order_by(order_by).limit(limit).offset(offset)
    rows = (await db.execute(stmt)).scalars().all()

    # total (same filters, no limit/offset)
    count_stmt = select(func.count()).select_from(select(Idea.id).where(*filters).subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    return rows, total

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
