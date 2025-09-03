from fastapi import APIRouter, Depends, HTTPException, status, Query, Response, Request
from app.core.rate_limit import limiter
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.schemas.user import (
    UserCreate, UserOut, Token, ProfileUpdate, ChangePasswordIn,
    MessageResponse, ForgotPasswordIn, ResetPasswordIn, RequestVerifyIn,
    VerifyEmailOut, VerifyEmailDevOut, VerifyEmailIn)
from app.services.users import (
    get_by_email, create_user, authenticate, set_user_password, update_profile,
    change_password, create_password_reset_token, reset_password_with_token,
    issue_email_verification, verify_email_with_token)
from app.core.security import create_access_token, verify_password
from app.core.tokens import hash_token
from app.core.config import settings
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    existing = await get_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await create_user(db, email=payload.email, password=payload.password, full_name=payload.full_name)

    # Fire off verification email (dev: still sent via logger if not configured)
    raw = await issue_email_verification(db, user)
    if not settings.EMAIL_ENABLED:
       # Expose dev-only info via headers to keep body schema stable
        response.headers["X-Dev-Verify-Link"] = f"/auth/verify-email?token={raw}"
        response.headers["X-Dev-Verify-Token"] = raw
    return UserOut.model_validate(user)


@router.post("/request-verify", response_model=VerifyEmailOut | VerifyEmailDevOut)
async def request_verify(payload: RequestVerifyIn, db: AsyncSession = Depends(get_db)):
    # Always return 200 to avoid user enumeration
    user = await get_by_email(db, payload.email)
    if user and user.is_active and not user.is_verified:
        raw = await issue_email_verification(db, user)
        # In dev, surface token to speed manual testing (mirrors forgot-password)
        if not settings.EMAIL_ENABLED:
            return VerifyEmailDevOut(
                message="If the account exists and is not verified, a verification email has been created. (dev mode)",
                dev_verify_link=f"/auth/verify-email?token={raw}",
                dev_token=raw,
            )
    return VerifyEmailOut(message="If the account exists and is not verified, a verification email has been sent.")

@router.post("/verify-email", response_model=VerifyEmailOut)
async def verify_email_post(payload: VerifyEmailIn, db: AsyncSession = Depends(get_db)):
    ok = await verify_email_with_token(db, payload.token)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")
    return VerifyEmailOut(message="Email verified. You can sign in now.")

@router.post("/token", response_model=Token)
@limiter.limit("10/minute")  # per-IP: 10 login attempts/min
async def login(request: Request, response: Response, form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate(db, email=form.username, password=form.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = create_access_token(str(user.id))

    # NEW: also set httpOnly cookie for the SPA
    response.set_cookie(
        key=settings.COOKIE_SESSION_NAME,
        value=token,
        httponly=True,
        secure=bool(settings.COOKIE_SECURE),
        samesite=settings.COOKIE_SAMESITE,  # "lax" recommended for email link flows
        max_age=settings.COOKIE_MAX_AGE_SECONDS,
        path="/",
    )

    return {"access_token": token, "token_type": "bearer"}

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    # clear cookie
    response.delete_cookie(
        key=settings.COOKIE_SESSION_NAME,
        path="/",
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)

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
    # Always return 200 (no user enumeration)
    if settings.EMAIL_ENABLED:
        # send real email
        from app.services.users import send_password_reset_email
        await send_password_reset_email(db, email=payload.email)
        return {"message": "If that account exists, a reset link has been sent."}
    else:
        # dev: create token but return it so you can test locally without email
        token = await create_password_reset_token(db, email=payload.email)
        return {
            "message": "If that account exists, a reset link has been created.",
            "dev_reset_link": f"/auth/reset-password?token={token}" if token else None,
            "dev_token": token,
        }

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    payload: ResetPasswordIn,
    db: AsyncSession = Depends(get_db),
):
    ok = await reset_password_with_token(db, token=payload.token, new_password=payload.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    return {"message": "Password has been reset. Please sign in."}


@router.get("/tokens/reset/validate")
@limiter.limit("30/minute")  # per-IP: 30 token checks/min
async def validate_reset_token(request: Request, token: str, db: AsyncSession = Depends(get_db)):
    # Reuse reset logic but don't consume the token:
    from sqlalchemy import select
    from app.models.password_reset import PasswordResetToken
    from datetime import datetime, timezone
    hashed = hash_token(token)
    now = datetime.now(timezone.utc)
    res = await db.execute(select(PasswordResetToken).where(
        PasswordResetToken.token_hash == hashed,
        PasswordResetToken.used_at.is_(None),
        PasswordResetToken.expires_at > now,
    ))
    return {"valid": res.scalar_one_or_none() is not None}

@router.get("/tokens/verify/validate")
@limiter.limit("30/minute")  # per-IP: 30 token checks/min
async def validate_verify_token(request: Request, token: str, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.models.email_verification import EmailVerificationToken
    from datetime import datetime, timezone
    hashed = hash_token(token)
    now = datetime.now(timezone.utc)
    res = await db.execute(select(EmailVerificationToken).where(
        EmailVerificationToken.token_hash == hashed,
        EmailVerificationToken.used_at.is_(None),
        EmailVerificationToken.expires_at > now,
    ))
    return {"valid": res.scalar_one_or_none() is not None}