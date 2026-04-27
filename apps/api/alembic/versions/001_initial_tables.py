"""initial tables

Revision ID: 001_initial_tables
Revises:
Create Date: 2026-04-27

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_tables"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(20), nullable=True),
        sa.Column("department", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
        sa.UniqueConstraint("email"),
    )

    # Create categories table
    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("level1", sa.String(100), nullable=False),
        sa.Column("level2", sa.String(100), nullable=False),
        sa.Column("warning_threshold_days", sa.Integer(), nullable=True),
        sa.Column("unopened_shelf_months", sa.Integer(), nullable=False),
        sa.Column("opened_shelf_months", sa.Integer(), nullable=False),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create ledgers table
    op.create_table(
        "ledgers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("internal_batch_no", sa.String(20), nullable=False),
        sa.Column("product_name", sa.String(255), nullable=False),
        sa.Column("batch_no", sa.String(100), nullable=False),
        sa.Column("cas_no", sa.String(50), nullable=False),
        sa.Column("weight_capacity", sa.String(50), nullable=False),
        sa.Column("supplier", sa.String(255), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=True),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cert_expiry_date", sa.Date(), nullable=False),
        sa.Column("open_date", sa.Date(), nullable=True),
        sa.Column("effective_expiry_date", sa.Date(), nullable=False),
        sa.Column("is_opened", sa.Boolean(), nullable=True),
        sa.Column("status", sa.String(20), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("open_date_entered_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("open_date_entered_at", sa.DateTime(), nullable=True),
        sa.Column("archived_at", sa.DateTime(), nullable=True),
        sa.Column("archived_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("internal_batch_no"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
    )

    # Create notifications table
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("ledger_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=True),
        sa.Column("sent_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["ledger_id"], ["ledgers.id"]),
    )

    # Create research_notebooks table
    op.create_table(
        "research_notebooks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("notebook_id", sa.String(255), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )

    # Create daily_usages table
    op.create_table(
        "daily_usages",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("question_count", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )


def downgrade() -> None:
    op.drop_table("daily_usages")
    op.drop_table("research_notebooks")
    op.drop_table("notifications")
    op.drop_table("ledgers")
    op.drop_table("categories")
    op.drop_table("users")
