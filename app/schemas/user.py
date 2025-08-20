from pydantic import BaseModel, EmailStr, StringConstraints
from typing import Annotated
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str | None = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserAdminOut(UserOut):
    is_superuser: bool  # expose to admins

class UserAdminUpdate(BaseModel):
    full_name: str | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None

class UserPublic(BaseModel):
    id: UUID
    full_name: str | None = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: str | None = None

class ProfileUpdate(BaseModel):
    full_name: str | None = None

Min8 = Annotated[str, StringConstraints(min_length=8, strip_whitespace=True)]

class ChangePasswordIn(BaseModel):
    current_password: str
    # Use Annotated + StringConstraints (Pydantic v2) instead of constr()
    new_password: Min8  # basic strength rule

class MessageResponse(BaseModel):
    message: str
