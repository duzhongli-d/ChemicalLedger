"""add system_settings table

Revision ID: 54bf62aebdbc
Revises: a1b2c3d4e5f6
Create Date: 2026-05-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid

# revision identifiers
revision = '54bf62aebdbc'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'system_settings',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('key', sa.String(100), nullable=False),
        sa.Column('value', sa.Text(), nullable=True),
        sa.Column('value_type', sa.String(20), server_default='string'),
        sa.Column('is_secret', sa.Boolean(), server_default='false'),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('updated_by_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('category', 'key', name='uq_category_key')
    )

    # 插入默认 SMTP 配置
    smtp_defaults = [
        ('smtp', 'enabled', 'false', 'bool', False, '是否启用 SMTP'),
        ('smtp', 'host', '', 'string', False, 'SMTP 服务器地址'),
        ('smtp', 'port', '587', 'int', False, 'SMTP 端口'),
        ('smtp', 'username', '', 'string', False, 'SMTP 用户名'),
        ('smtp', 'password', '', 'string', True, 'SMTP 密码'),
        ('smtp', 'sender_email', '', 'string', False, '发件人邮箱'),
        ('smtp', 'sender_name', '', 'string', False, '发件人名称'),
        ('smtp', 'use_tls', 'true', 'bool', False, '是否使用 TLS'),
    ]
    for cat, k, v, vt, secret, desc in smtp_defaults:
        op.execute(f"INSERT INTO system_settings (id, category, key, value, value_type, is_secret, description) VALUES ('{uuid.uuid4()}', '{cat}', '{k}', '{v}', '{vt}', {secret}, '{desc}')")

    # 插入默认联系信息
    contact_defaults = [
        ('contact', 'address', '', 'string', False, '公司地址'),
        ('contact', 'phone', '', 'string', False, '联系电话'),
        ('contact', 'email', '', 'string', False, '客服邮箱'),
        ('contact', 'wechat', '', 'string', False, '微信公众号'),
        ('contact', 'business_hours', '', 'string', False, '营业时间'),
    ]
    for cat, k, v, vt, secret, desc in contact_defaults:
        op.execute(f"INSERT INTO system_settings (id, category, key, value, value_type, is_secret, description) VALUES ('{uuid.uuid4()}', '{cat}', '{k}', '{v}', '{vt}', {secret}, '{desc}')")


def downgrade():
    op.drop_table('system_settings')