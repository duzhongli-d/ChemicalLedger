"""add annual_summaries table

Revision ID: a1b2c3d4e5f6
Revises: 5a8fab7c8f80
Create Date: 2026-05-05 15:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import func


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '5a8fab7c8f80'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('annual_summaries',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('section', sa.String(50), nullable=False),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('project_count', sa.Integer(), default=0),
        sa.Column('project_names', sa.Text(), nullable=True),
        sa.Column('batch_count', sa.Integer(), default=0),
        sa.Column('yoy_growth', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('year', 'section', 'category', name='uq_annual_summary_year_section_category'),
    )


def downgrade() -> None:
    op.drop_table('annual_summaries')