import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = sa.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = sa.Column(sa.String(320), unique=True, nullable=False, index=True)
    hashed_password = sa.Column(sa.String(255), nullable=False)
    full_name = sa.Column(sa.String(200), nullable=True)
    is_active = sa.Column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_superuser = sa.Column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_verified = sa.Column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    created_at = sa.Column(sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False)
    updated_at = sa.Column(sa.DateTime(timezone=True), server_default=sa.text("now()"), onupdate=func.now(), nullable=False)