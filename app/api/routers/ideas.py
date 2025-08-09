from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.schemas.idea import IdeaCreate, IdeaOut, IdeaUpdate, MessageResponse, IdeasPage
from app.services.ideas import create, get, list_, update_, delete_
from enum import Enum

class IdeaSort(str, Enum):
    created_at = "created_at"
    score = "score"

class IdeaOrder(str, Enum):
    asc = "asc"
    desc = "desc"

router = APIRouter()

@router.post("/", response_model=IdeaOut, status_code=status.HTTP_201_CREATED)
async def create_idea(payload: IdeaCreate, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump()
    if not data["uses_ai"]:
        data["ai_complexity"] = 0
    return await create(db, data)

@router.get("/", response_model=IdeasPage)
async def list_ideas(
    limit: int = 20,
    offset: int = 0,
    sort: IdeaSort = IdeaSort.created_at,       # "created_at" | "score"
    order: IdeaOrder = IdeaOrder.desc,            # "asc" | "desc"
    q: str | None = None,           # search in title/description
    uses_ai: bool | None = None,    # true/false
    min_score: float | None = None, # 0..5
    max_score: float | None = None, # 0..5
    db: AsyncSession = Depends(get_db),
):
    items, total = await list_(
        db, limit=limit, offset=offset, sort=sort, order=order,
        q=q, uses_ai=uses_ai, min_score=min_score, max_score=max_score,
    )
    return {"items": items, "total": total, "limit": limit, "offset": offset}

@router.get("/{idea_id}", response_model=IdeaOut)
async def get_idea(idea_id: str, db: AsyncSession = Depends(get_db)):
    obj = await get(db, idea_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Idea not found")
    return obj

@router.patch("/{idea_id}", response_model=IdeaOut)
async def update_idea(idea_id: str, payload: IdeaUpdate, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump(exclude_unset=True)
    if "uses_ai" in data and data.get("uses_ai") is False:
        data["ai_complexity"] = 0
    obj = await update_(db, idea_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Idea not found")
    return obj

@router.delete("/{idea_id}", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def delete_idea(idea_id: str, db: AsyncSession = Depends(get_db)):
    ok = await delete_(db, idea_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Idea not found")
    return {"message": f"Idea {idea_id} deleted"}
