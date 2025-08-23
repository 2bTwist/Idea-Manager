from pydantic import BaseModel, Field, field_validator
from typing import List
from uuid import UUID
from datetime import datetime
from app.schemas.user import UserPublic


ALLOWED_TAGS = {
    "web","mobile","ai","ml","iot","blockchain","arvr","health","education",
    "finance","entertainment","social","ecommerce","productivity","gaming"
}

class IdeaBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str
    scalability: int = Field(ge=1, le=5)
    ease_to_build: int = Field(ge=1, le=5)
    uses_ai: bool = False
    ai_complexity: int = Field(ge=0, le=5)
    tags: List[str] = []    

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        if len(v) != len(set(v)):
            raise ValueError("Duplicate tags are not allowed")
        unknown = [t for t in v if t not in ALLOWED_TAGS]
        if unknown:
            allow = ", ".join(sorted(ALLOWED_TAGS))
            raise ValueError(f"Unknown tags: {unknown}. Allowed: {allow}")
        return v

class IdeaCreate(IdeaBase):
    pass

class IdeaUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    scalability: int | None = Field(default=None, ge=1, le=5)
    ease_to_build: int | None = Field(default=None, ge=1, le=5)
    uses_ai: bool | None = None
    ai_complexity: int | None = Field(default=None, ge=0, le=5)
    tags: List[str] | None = None 

class IdeaOut(BaseModel):
    id: UUID
    title: str
    description: str
    scalability: int
    ease_to_build: int
    uses_ai: bool
    ai_complexity: int
    tags: List[str] | None = None
    score: float
    created_at: datetime
    updated_at: datetime
    owner: UserPublic | None = None

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    message: str

class IdeasPage(BaseModel):
    items: list[IdeaOut]
    total: int
    limit: int
    offset: int

class TagsOut(BaseModel):
    available: List[str]