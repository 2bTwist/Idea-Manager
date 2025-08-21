from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.schemas.user import (
    UserCreate, UserOut, Token, ProfileUpdate, ChangePasswordIn, 
    MessageResponse, ForgotPasswordIn, ResetPasswordIn, RequestVerifyIn, VerifyEmailOut)
from app.services.users import (
    get_by_email, create_user, authenticate, set_user_password, update_profile,
    change_password, create_password_reset_token, reset_password_with_token,
    issue_email_verification, verify_email_with_token)
from app.core.security import create_access_token, verify_password
from app.core.config import settings
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await create_user(db, email=payload.email, password=payload.password, full_name=payload.full_name)

    # Fire off verification email (dev: still sent via logger if not configured)
    await issue_email_verification(db, user)
    return UserOut.model_validate(user)


@router.post("/request-verify", response_model=VerifyEmailOut)
async def request_verify(payload: RequestVerifyIn, db: AsyncSession = Depends(get_db)):
    # Always return 200 to avoid user enumeration
    user = await get_by_email(db, payload.email)
    if user and user.is_active and not user.is_verified:
        await issue_email_verification(db, user)
    return VerifyEmailOut(message="If the account exists and is not verified, a verification email has been sent.")

@router.get("/verify-email", response_model=VerifyEmailOut)
async def verify_email(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    ok = await verify_email_with_token(db, token)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")
    return VerifyEmailOut(message="Email verified! You can close this tab and sign in.")

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

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    payload: ForgotPasswordIn,
    db: AsyncSession = Depends(get_db),
):
    # Always return 200 to avoid user enumeration.
    token = await create_password_reset_token(db, email=payload.email)
    if settings.APP_ENV in ("dev", "development"):
        # For local/dev: return the link so you can click it in Swagger.
        return {
            "message": "If that account exists, a reset link has been created.",
            "dev_reset_link": f"/auth/reset-password?token={token}" if token else None,
            "dev_token": token,  # helpful in local testing
        }
    return {"message": "If that account exists, a reset link has been sent."}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    payload: ResetPasswordIn,
    db: AsyncSession = Depends(get_db),
):
    ok = await reset_password_with_token(db, token=payload.token, new_password=payload.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    return {"message": "Password has been reset. Please sign in."}
