from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.schemas.user import UserCreate, UserOut, Token, ProfileUpdate, ChangePasswordIn, MessageResponse
from app.services.users import get_by_email, create_user, authenticate, set_user_password, update_profile, change_password
from app.core.security import create_access_token, verify_password
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await create_user(db, email=payload.email, password=payload.password, full_name=payload.full_name)
    return UserOut.model_validate(user)

@router.post("/token", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate(db, email=form.username, password=form.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.patch("/me", response_model=UserOut, summary="Update my profile")
async def update_me(
    payload: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only allow safe profile fields (currently just full_name)
    updated = await update_profile(db, current_user, full_name=payload.full_name)
    return UserOut.model_validate(updated)

@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password_route(
    payload: ChangePasswordIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ok = await change_password(
        db,
        user_id=current_user.id,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
    if not ok:
        # Intentionally vague to avoid leaking which check failed
        raise HTTPException(status_code=400, detail="Invalid current password")
    # Clients should discard the old token and log in again.
    return {"message": "Password changed successfully. Please sign in again."}
