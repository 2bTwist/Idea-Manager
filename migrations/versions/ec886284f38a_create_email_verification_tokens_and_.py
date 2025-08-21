"""create email_verification_tokens and user.is_verified

Revision ID: ec886284f38a
Revises: 74d66358753e
Create Date: 2025-08-21 16:10:13.203417

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ec886284f38a'
down_revision: Union[str, Sequence[str], None] = '74d66358753e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
     # users.is_verified
    op.add_column("users", sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")))

    # email_verification_tokens
    op.create_table(
        "email_verification_tokens",
        sa.Column("id", sa.UUID(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_evt_user_id", "email_verification_tokens", ["user_id"])
    op.create_index("ix_evt_token_hash", "email_verification_tokens", ["token_hash"], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_evt_token_hash", table_name="email_verification_tokens")
    op.drop_index("ix_evt_user_id", table_name="email_verification_tokens")
    op.drop_table("email_verification_tokens")
    op.drop_column("users", "is_verified")