"""add users table and idea ownership

Revision ID: 1e4a4241000d
Revises: a0e6d8117d4b
Create Date: 2025-08-12 01:49:27.175756
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1e4a4241000d'
down_revision: Union[str, Sequence[str], None] = 'a0e6d8117d4b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: create users; add owner_id to ideas with FK."""
    # --- users table ---
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=200), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # --- ideas.owner_id ---
    op.add_column("ideas", sa.Column("owner_id", sa.UUID(), nullable=True))
    op.create_index("ix_ideas_owner_id", "ideas", ["owner_id"], unique=False)
    op.create_foreign_key(
        "fk_ideas_owner_id_users",
        source_table="ideas",
        referent_table="users",
        local_cols=["owner_id"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    """Downgrade schema: drop FK/index/column, then users."""
    op.drop_constraint("fk_ideas_owner_id_users", "ideas", type_="foreignkey")
    op.drop_index("ix_ideas_owner_id", table_name="ideas")
    op.drop_column("ideas", "owner_id")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
