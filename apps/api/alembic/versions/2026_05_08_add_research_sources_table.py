"""add research_sources table

Revision ID: 98cb77efe7cc
Revises: 54bf62aebdbc
Create Date: 2026-05-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid

# revision identifiers
revision = '98cb77efe7cc'
down_revision = '54bf62aebdbc'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'research_sources',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('notebook_id', UUID(as_uuid=True), sa.ForeignKey('research_notebooks.id'), nullable=False),
        sa.Column('source_type', sa.String(20), nullable=False),
        sa.Column('file_url', sa.Text(), nullable=True),
        sa.Column('file_name', sa.String(255), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(20), server_default='PENDING'),
        sa.Column('notebooklm_id', sa.String(255), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_research_sources_notebook_id', 'research_sources', ['notebook_id'])
    op.create_index('ix_research_sources_status', 'research_sources', ['status'])


def downgrade():
    op.drop_index('ix_research_sources_status')
    op.drop_index('ix_research_sources_notebook_id')
    op.drop_table('research_sources')
