import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.base import Base

class Idea(Base):
    __tablename__ = "ideas"

    id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = sa.Column(sa.String(200), nullable=False)
    description = sa.Column(sa.Text, nullable=False)

    scalability = sa.Column(sa.Integer, nullable=False) # 1-5 scale
    ease_to_build = sa.Column(sa.Integer, nullable=False, default=1) # 1-5 scale
    uses_ai = sa.Column(sa.Boolean, nullable=False, default=False)
    ai_complexity = sa.Column(sa.Integer, nullable=False, default=0)  # 0-5 scale

    created_at = sa.Column(sa.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = sa.Column(sa.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
