"""create password_reset_tokens

Revision ID: 74d66358753e
Revises: c0fe1fb72384
Create Date: 2025-08-21 02:22:58.847936

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '74d66358753e'
down_revision: Union[str, Sequence[str], None] = 'c0fe1fb72384'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.UUID(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_prt_user_id", "password_reset_tokens", ["user_id"])
    op.create_index("ix_prt_token_hash", "password_reset_tokens", ["token_hash"], unique=True)

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_prt_token_hash", "password_reset_tokens")
    op.drop_index("ix_prt_user_id", "password_reset_tokens")
    op.drop_table("password_reset_tokens")
