"""add cascade delete research_sources

Revision ID: xxxxx_add_cascade_delete
Revises: 98cb77efe7cc
Create Date: 2026-05-09

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'xxxxx_add_cascade_delete'
down_revision = '98cb77efe7cc'
branch_labels = None
depends_on = None


def upgrade():
    # Drop the existing FK constraint and index, then recreate with cascade
    op.drop_index('ix_research_sources_notebook_id', table_name='research_sources')
    op.drop_constraint(
        'research_sources_notebook_id_fkey',
        'research_sources',
        type_='foreignkey'
    )
    op.create_foreign_key(
        'research_sources_notebook_id_fkey',
        'research_sources',
        'research_notebooks',
        ['notebook_id'],
        ['id'],
        ondelete='cascade'
    )
    op.create_index('ix_research_sources_notebook_id', 'research_sources', ['notebook_id'])


def downgrade():
    op.drop_index('ix_research_sources_notebook_id', table_name='research_sources')
    op.drop_constraint(
        'research_sources_notebook_id_fkey',
        'research_sources',
        type_='foreignkey'
    )
    op.create_foreign_key(
        'research_sources_notebook_id_fkey',
        'research_sources',
        'research_notebooks',
        ['notebook_id'],
        ['id']
    )
    op.create_index('ix_research_sources_notebook_id', 'research_sources', ['notebook_id'])