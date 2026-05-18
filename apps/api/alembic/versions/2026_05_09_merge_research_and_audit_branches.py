"""merge research/contact branches with audit branch

Revision ID: 9a3c4d2e1f00
Revises: ('7f798208f193', 'bbbbbbbbbbbb', 'cccccccccccc')
Create Date: 2026-05-09

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '9a3c4d2e1f00'
down_revision: Union[str, Sequence[str], None] = ('7f798208f193', 'bbbbbbbbbbbb', 'cccccccccccc')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # No schema changes - this is a history merge to unify two parallel branches:
    # Branch 1: 001_initial_tables -> 7f798208f193 (audit_logs, daily_stats, timezone columns)
    # Branch 2: 001_initial_tables -> ... -> cccccccccccc (research_sources table) -> bbbbbbbbbbbb (cascade FK) -> here
    pass


def downgrade() -> None:
    pass
