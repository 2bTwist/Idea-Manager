from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api.deps import get_db, require_superuser
from app.schemas.user import UserAdminOut, UserAdminUpdate
from app.services.users import list_users, update_user_admin, delete_user

router = APIRouter()

@router.get("/", response_model=dict)
async def admin_list_users(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    q: str | None = Query(None, description="Search email/full_name"),
    is_active: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _admin = Depends(require_superuser),
):
    items, total = await list_users(db, limit=limit, offset=offset, q=q, is_active=is_active)
    # Convert SQLAlchemy models to Pydantic schemas
    items_out = [UserAdminOut.model_validate(item) for item in items]
    return {"items": items_out, "total": total, "limit": limit, "offset": offset}

@router.patch("/{user_id}", response_model=UserAdminOut)
async def admin_update_user(
    user_id: UUID,
    payload: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    _admin = Depends(require_superuser),
):
    data = payload.model_dump(exclude_unset=True)
    updated = await update_user_admin(db, user_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return UserAdminOut.model_validate(updated)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin = Depends(require_superuser),
):
    ok = await delete_user(db, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return None
