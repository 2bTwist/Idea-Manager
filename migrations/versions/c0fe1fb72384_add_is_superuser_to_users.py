"""add is_superuser to users

Revision ID: c0fe1fb72384
Revises: 1e4a4241000d
Create Date: 2025-08-16 21:32:05.286225

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c0fe1fb72384'
down_revision: Union[str, Sequence[str], None] = '1e4a4241000d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default=sa.text("false")))



def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "is_superuser")
