"""merge research/contact branches with audit branch

Revision ID: 9a3c4d2e1f00
Revises: ('7f798208f193', '98cb77efe7cc')
Create Date: 2026-05-09

"""
from alembic import op

revision = '9a3c4d2e1f00'
down_revision = ('7f798208f193', '98cb77efe7cc')


def upgrade():
    # No schema changes - this is a history merge to unify two parallel branches:
    # Branch 1: 001_initial_tables -> 7f798208f193 (audit_logs, daily_stats, timezone columns)
    # Branch 2: 001_initial_tables -> ... -> xxxxx_add_cascade_delete (contact, annual_summaries, research_sources, cascade)
    pass


def downgrade():
    pass
