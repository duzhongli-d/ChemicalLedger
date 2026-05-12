"""add cascade delete research_sources

Revision ID: 98cb77efe7cc
Revises: 473b8d5568a
Create Date: 2026-05-09

"""
from alembic import op

# Constants for maintainability
TABLE_NAME = 'research_sources'
RELATED_TABLE = 'research_notebooks'
FK_COLUMN = 'notebook_id'
FK_RELATED_COLUMN = 'id'
FK_CONSTRAINT_NAME = 'research_sources_notebook_id_fkey'
INDEX_NAME = 'ix_research_sources_notebook_id'


def upgrade():
    # Drop FK constraint and recreate with cascade delete
    op.drop_constraint(FK_CONSTRAINT_NAME, TABLE_NAME, type_='foreignkey')
    op.create_foreign_key(
        FK_CONSTRAINT_NAME, TABLE_NAME, RELATED_TABLE,
        [FK_COLUMN], [FK_RELATED_COLUMN],
        ondelete='cascade'
    )


def downgrade():
    # Remove cascade from FK constraint
    op.drop_constraint(FK_CONSTRAINT_NAME, TABLE_NAME, type_='foreignkey')
    op.create_foreign_key(
        FK_CONSTRAINT_NAME, TABLE_NAME, RELATED_TABLE,
        [FK_COLUMN], [FK_RELATED_COLUMN]
    )