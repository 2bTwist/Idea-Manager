"""add tags array to ideas

Revision ID: 142fc07b3483
Revises: ec886284f38a
Create Date: 2025-08-22 03:19:53.550451

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg

# revision identifiers, used by Alembic.
revision: str = '142fc07b3483'
down_revision: Union[str, Sequence[str], None] = 'ec886284f38a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
     # Add TEXT[] column with empty-array default
    op.add_column(
        "ideas",
        sa.Column("tags", pg.ARRAY(sa.String(length=30)), nullable=False, server_default="{}"),
    )
    # Backfill (not strictly needed because default is {})
    op.execute("UPDATE ideas SET tags = '{}' WHERE tags IS NULL;")
    # Create GIN index for overlap queries
    op.create_index("ix_ideas_tags_gin", "ideas", ["tags"], unique=False, postgresql_using="gin")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_ideas_tags_gin", table_name="ideas")
    op.drop_column("ideas", "tags")
