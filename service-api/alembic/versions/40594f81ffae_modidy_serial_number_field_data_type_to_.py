"""allow id card validity dates to be null

Revision ID: 40594f81ffae
Revises: efdc7df08e0b
Create Date: 2026-09-11 12:38:04.375240

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '40594f81ffae'
down_revision: Union[str, Sequence[str], None] = 'efdc7df08e0b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'addinfoanswers',
        'idCardValidPeriodStart',
        schema='openaccount',
        existing_type=sa.Date(),
        existing_nullable=False,
        nullable=True,
    )
    op.alter_column(
        'addinfoanswers',
        'idCardValidPeriodEnd',
        schema='openaccount',
        existing_type=sa.Date(),
        existing_nullable=False,
        nullable=True,
    )

def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'addinfoanswers',
        'idCardValidPeriodEnd',
        schema='openaccount',
        existing_type=sa.Date(),
        existing_nullable=True,
        nullable=False,
    )
    op.alter_column(
        'addinfoanswers',
        'idCardValidPeriodStart',
        schema='openaccount',
        existing_type=sa.Date(),
        existing_nullable=True,
        nullable=False,
    )
