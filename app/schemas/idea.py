from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class IdeaBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str
    scalability: int = Field(ge=1, le=5)
    ease_to_build: int = Field(ge=1, le=5)
    uses_ai: bool = False
    ai_complexity: int = Field(ge=0, le=5)

class IdeaCreate(IdeaBase):
    pass

class IdeaUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    scalability: int | None = Field(default=None, ge=1, le=5)
    ease_to_build: int | None = Field(default=None, ge=1, le=5)
    uses_ai: bool | None = None
    ai_complexity: int | None = Field(default=None, ge=0, le=5)

class IdeaOut(BaseModel):
    id: UUID
    title: str
    description: str
    scalability: int
    ease_to_build: int
    uses_ai: bool
    ai_complexity: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    message: str