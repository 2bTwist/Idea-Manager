"""enforce NOT NULL and defaults on idea fields

Revision ID: a0e6d8117d4b
Revises: bc365be279a1
Create Date: 2025-08-09 06:48:00.652786

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a0e6d8117d4b'
down_revision: Union[str, Sequence[str], None] = 'bc365be279a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Backfill any NULLs so NOT NULL doesn't fail
    op.execute("UPDATE ideas SET ease_to_build = 3 WHERE ease_to_build IS NULL;")
    op.execute("UPDATE ideas SET ai_complexity = 0 WHERE ai_complexity IS NULL;")

    # Enforce NOT NULL on ease_to_build
    op.alter_column(
        "ideas",
        "ease_to_build",
        existing_type=sa.Integer(),
        nullable=False,
        existing_nullable=True,
    )

    # Add server default on ai_complexity = 0
    op.alter_column(
        "ideas",
        "ai_complexity",
        existing_type=sa.Integer(),
        server_default=sa.text("0"),
        existing_nullable=False,
    )

    # (Optional but nice) add server default for uses_ai = false
    op.alter_column(
        "ideas",
        "uses_ai",
        existing_type=sa.Boolean(),
        server_default=sa.text("false"),
        existing_nullable=False,
    )


def downgrade() -> None:
    # Remove server defaults
    op.alter_column(
        "ideas",
        "uses_ai",
        existing_type=sa.Boolean(),
        server_default=None,
        existing_nullable=False,
    )
    op.alter_column(
        "ideas",
        "ai_complexity",
        existing_type=sa.Integer(),
        server_default=None,
        existing_nullable=False,
    )

    # Allow NULLs again on ease_to_build
    op.alter_column(
        "ideas",
        "ease_to_build",
        existing_type=sa.Integer(),
        nullable=True,
        existing_nullable=False,
    )
