import sqlalchemy as sa
from sqlalchemy import orm
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_property
import uuid
from sqlalchemy.dialects.postgresql import ARRAY
from app.db.base import Base
from app.core.config import settings


def _norm15(col):  # maps 1..5 -> 0..1
    return (sa.cast(col, sa.Float) - 1.0) / 4.0

def _norm05(col):  # maps 0..5 -> 0..1
    return sa.cast(col, sa.Float) / 5.0

def _ai_flag(col):
    return sa.case((col.is_(True), 1.0), else_=0.0)

class Idea(Base):
    __tablename__ = "ideas"

    id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = sa.Column(sa.String(200), nullable=False)
    description = sa.Column(sa.Text, nullable=False)

    scalability = sa.Column(sa.Integer, nullable=False) # 1-5 scale
    ease_to_build = sa.Column(sa.Integer, nullable=False, default=1) # 1-5 scale
    uses_ai = sa.Column(sa.Boolean, nullable=False, default=False)
    ai_complexity = sa.Column(sa.Integer, nullable=False, default=0)  # 0-5 scale
    tags = sa.Column(ARRAY(sa.String(length=30)), nullable=False, server_default="{}")

    created_at = sa.Column(sa.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = sa.Column(sa.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ownership
    owner_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True, index=True)
    owner = orm.relationship("User", backref="ideas")

    # ---------------- score (computed) ----------------
    @hybrid_property
    def score(self) -> float:
        w = settings
        def norm15(v): return (v - 1.0) / 4.0
        def norm05(v): return v / 5.0
        base = (
            w.SCORE_W_SCALABILITY * norm15(self.scalability)
            + w.SCORE_W_EASE * norm15(self.ease_to_build)
            + w.SCORE_W_AI_FLAG * (1.0 if self.uses_ai else 0.0)
            + w.SCORE_W_AI_COMPLEX * norm05(self.ai_complexity)
        )
        return base * 5.0  # final score 0..5

    @score.expression
    def score(cls):
        w = settings
        base = (
            w.SCORE_W_SCALABILITY * _norm15(cls.scalability)
            + w.SCORE_W_EASE * _norm15(cls.ease_to_build)
            + w.SCORE_W_AI_FLAG * _ai_flag(cls.uses_ai)
            + w.SCORE_W_AI_COMPLEX * _norm05(cls.ai_complexity)
        )
        return base * 5.0
    
# Fast overlap queries (tags && array)
sa.Index("ix_ideas_tags_gin", Idea.tags, postgresql_using="gin")
