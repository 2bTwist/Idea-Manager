import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.base import Base

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = sa.Column(UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = sa.Column(sa.String(128), nullable=False, unique=True, index=True)
    expires_at = sa.Column(sa.DateTime(timezone=True), nullable=False)
    used_at = sa.Column(sa.DateTime(timezone=True), nullable=True)  
    created_at = sa.Column(sa.DateTime(timezone=True), nullable=False, server_default=func.now())
