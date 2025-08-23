from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user, require_verified
from app.schemas.idea import IdeaCreate, IdeaOut, IdeaUpdate, MessageResponse, IdeasPage, ALLOWED_TAGS
from app.services.ideas import create, get, list_, update_, delete_, add_tags, remove_tags
from enum import Enum
from app.models.user import User

class IdeaSort(str, Enum):
    created_at = "created_at"
    score = "score"

class IdeaOrder(str, Enum):
    asc = "asc"
    desc = "desc"

router = APIRouter()

@router.post("/", response_model=IdeaOut, status_code=status.HTTP_201_CREATED)
async def create_idea(payload: IdeaCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = payload.model_dump()
    if not data["uses_ai"]:
        data["ai_complexity"] = 0
    data["owner_id"] = current_user.id
    return await create(db, data, owner_id=current_user.id)

@router.get("/", response_model=IdeasPage)
async def list_ideas(
    limit: int = Query(20, ge=1, le=100, description="Max items to return"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    sort: IdeaSort = Query(IdeaSort.created_at, description="Sort field"),
    order: IdeaOrder = Query(IdeaOrder.desc, description="Sort direction"),
    q: str | None = Query(None, description="Search in title/description"),
    uses_ai: bool | None = Query(None, description="Filter by AI usage"),
    min_score: float | None = Query(None, ge=0, le=5, description="Min score (0..5)"),
    max_score: float | None = Query(None, ge=0, le=5, description="Max score (0..5)"),
    tags: List[str] | None = Query(None, description="Match ANY of these tag slugs"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_verified),
):
    if (min_score is not None and max_score is not None) and (min_score > max_score):
        raise HTTPException(status_code=400, detail="min_score cannot be greater than max_score")
    
    items, total = await list_(
        db, limit=limit, offset=offset, sort=sort, order=order,
        q=q, uses_ai=uses_ai, min_score=min_score, max_score=max_score,
        owner_id=current_user.id, tags_any=tags,
    )
    return {"items": items, "total": total, "limit": limit, "offset": offset}

@router.get("/{idea_id}", response_model=IdeaOut)
async def get_idea(idea_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    obj = await get(db, idea_id, owner_id=current_user.id)
    if not obj:
        raise HTTPException(status_code=404, detail="Idea not found")
    if obj.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Idea not found")
    return obj

@router.patch("/{idea_id}", response_model=IdeaOut)
async def update_idea(idea_id: str, payload: IdeaUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = payload.model_dump(exclude_unset=True)
    if "uses_ai" in data and data.get("uses_ai") is False:
        data["ai_complexity"] = 0
    obj = await update_(db, idea_id, data, owner_id=current_user.id)
    if not obj:
        raise HTTPException(status_code=404, detail="Idea not found")
    if obj.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Idea not found")
    return obj

@router.delete("/{idea_id}", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def delete_idea(idea_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ok = await delete_(db, idea_id, owner_id=current_user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Idea not found")
    return {"message": f"Idea {idea_id} deleted"}


@router.get("/meta/tags", summary="List available tag slugs")
async def list_available_tags():
    return {"available": sorted(ALLOWED_TAGS)}

# Add tags (idempotent union)
@router.post("/{idea_id}/tags", response_model=IdeaOut, summary="Add tags to idea")
async def add_tags_route(
    idea_id: str,
    payload: dict,  # {"tags": ["web","ai"]}
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tags = payload.get("tags") or []
    # Basic validation using same allowed set
    bad = [t for t in tags if t not in ALLOWED_TAGS]
    if bad:
        raise HTTPException(status_code=400, detail=f"Unknown tags: {bad}")
    obj = await add_tags(db, idea_id, tags, owner_id=current_user.id)
    if not obj:
        raise HTTPException(status_code=404, detail="Idea not found")
    return obj

# Remove tags (idempotent difference)
@router.delete("/{idea_id}/tags", response_model=IdeaOut, summary="Remove tags from idea")
async def remove_tags_route(
    idea_id: str,
    payload: dict,  # {"tags": ["ai"]}
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tags = payload.get("tags") or []
    obj = await remove_tags(db, idea_id, tags, owner_id=current_user.id)
    if not obj:
        raise HTTPException(status_code=404, detail="Idea not found")
    return obj