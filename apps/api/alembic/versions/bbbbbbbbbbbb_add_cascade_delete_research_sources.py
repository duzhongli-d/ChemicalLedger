"""add cascade delete research_sources

Revision ID: bbbbbbbbbbbb
Revises: 473b8d55_68a
Create Date: 2026-05-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "bbbbbbbbbbbb"
down_revision: Union[str, None] = "473b8d55_68a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Constants for maintainability
TABLE_NAME = 'research_sources'
RELATED_TABLE = 'research_notebooks'
FK_COLUMN = 'notebook_id'
FK_RELATED_COLUMN = 'id'
FK_CONSTRAINT_NAME = 'research_sources_notebook_id_fkey'


def _cascade_constraint():
    return op.create_foreign_key(
        FK_CONSTRAINT_NAME, TABLE_NAME, RELATED_TABLE,
        [FK_COLUMN], [FK_RELATED_COLUMN],
        ondelete='cascade'
    )


def _plain_constraint():
    return op.create_foreign_key(
        FK_CONSTRAINT_NAME, TABLE_NAME, RELATED_TABLE,
        [FK_COLUMN], [FK_RELATED_COLUMN]
    )


def upgrade():
    op.drop_constraint(FK_CONSTRAINT_NAME, TABLE_NAME, type_='foreignkey')
    _cascade_constraint()


def downgrade():
    op.drop_constraint(FK_CONSTRAINT_NAME, TABLE_NAME, type_='foreignkey')
    _plain_constraint()