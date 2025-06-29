"""Add 'expired' to Score status enum

Revision ID: 6a30ca8cfa79
Revises: e689adbb24f1
Create Date: 2025-05-28 23:02:31.682078

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6a30ca8cfa79'
down_revision: Union[str, None] = 'e689adbb24f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.alter_column(
        'score',
        'status',
        existing_type=sa.Enum('pending', 'completed'),
        type_=sa.Enum('pending', 'completed', 'expired'),
        existing_nullable=False
    )

def downgrade():
    op.alter_column(
        'score',
        'status',
        existing_type=sa.Enum('pending', 'completed', 'expired'),
        type_=sa.Enum('pending', 'completed'),
        existing_nullable=False
    )
