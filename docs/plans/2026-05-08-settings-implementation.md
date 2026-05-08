# Settings 管理后台实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在管理后台增加 Settings 菜单，提供 SMTP 邮箱配置和联系信息配置功能

**Architecture:** 使用 `category + key` 的 key-value 模式存储配置，支持运行时修改。API 层提供统一的 GET/PATCH 接口，前端使用 Tab 界面展示

**Tech Stack:** FastAPI + SQLAlchemy + Alembic (后端)，Next.js + Tailwind (前端)

---

## Task 1: 创建数据库迁移

**Files:**
- Create: `apps/api/alembic/versions/xxxx_add_system_settings_table.py`

**Step 1: 创建迁移文件**

```python
"""add system_settings table

Revision ID: xxxx
Revises: xxxx
Create Date: 2026-05-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid

# revision identifiers
revision = 'xxxx'
down_revision = 'a1b2c3d4e5f6'  # 需要替换为最新的 migration id
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
        ('smtp', 'enabled', 'false', 'bool', false, '是否启用 SMTP'),
        ('smtp', 'host', '', 'string', false, 'SMTP 服务器地址'),
        ('smtp', 'port', '587', 'int', false, 'SMTP 端口'),
        ('smtp', 'username', '', 'string', false, 'SMTP 用户名'),
        ('smtp', 'password', '', 'string', true, 'SMTP 密码'),
        ('smtp', 'sender_email', '', 'string', false, '发件人邮箱'),
        ('smtp', 'sender_name', '', 'string', false, '发件人名称'),
        ('smtp', 'use_tls', 'true', 'bool', false, '是否使用 TLS'),
    ]
    for cat, k, v, vt, secret, desc in smtp_defaults:
        op.execute(f"INSERT INTO system_settings (category, key, value, value_type, is_secret, description) VALUES ('{cat}', '{k}', '{v}', '{vt}', {secret}, '{desc}')")

    # 插入默认联系信息
    contact_defaults = [
        ('contact', 'address', '', 'string', false, '公司地址'),
        ('contact', 'phone', '', 'string', false, '联系电话'),
        ('contact', 'email', '', 'string', false, '客服邮箱'),
        ('contact', 'wechat', '', 'string', false, '微信公众号'),
        ('contact', 'business_hours', '', 'string', false, '营业时间'),
    ]
    for cat, k, v, vt, secret, desc in contact_defaults:
        op.execute(f"INSERT INTO system_settings (category, key, value, value_type, is_secret, description) VALUES ('{cat}', '{k}', '{v}', '{vt}', {secret}, '{desc}')")


def downgrade():
    op.drop_table('system_settings')
```

**Step 2: 运行迁移**

Run: `cd apps/api && alembic upgrade head`
Expected: SUCCESS with "Running upgrade -> xxxx"

**Step 3: 验证迁移**

Run: `cd apps/api && alembic current && psql $DATABASE_URL -c "SELECT category, key FROM system_settings"`
Expected: 显示 smtp 和 contact 两组配置

**Step 4: Commit**

```bash
git add apps/api/alembic/versions/xxxx_add_system_settings_table.py
git commit -m "feat(api): add system_settings table for SMTP and contact config"
```

---

## Task 2: 添加 SystemSetting 模型

**Files:**
- Modify: `apps/api/app/db/models.py`

**Step 1: 添加模型**

在 `models.py` 末尾添加：

```python
class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid_lib.uuid4)
    category = Column(String(50), nullable=False, index=True)
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=True)
    value_type = Column(String(20), server_default="string")
    is_secret = Column(Boolean, server_default=False)
    description = Column(String(255), nullable=True)
    updated_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    updated_by = relationship("User", foreign_keys=[updated_by_id])

    __table_args__ = (
        UniqueConstraint("category", "key", name="uq_category_key"),
    )
```

**Step 2: 运行测试验证**

Run: `cd apps/api && python -c "from app.db.models import SystemSetting; print('Model OK')"`
Expected: 无错误输出

**Step 3: Commit**

```bash
git add apps/api/app/db/models.py
git commit -m "feat(api): add SystemSetting model"
```

---

## Task 3: 添加 Pydantic Schema

**Files:**
- Modify: `apps/api/app/schemas/schemas.py`

**Step 1: 添加 Schema**

在 `schemas.py` 文件末尾添加（在 `AnnualSummaryResponse` 之后）：

```python
# System Settings Schemas

class SMTPConfigBase(BaseModel):
    enabled: Optional[bool] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    sender_email: Optional[str] = None
    sender_name: Optional[str] = None
    use_tls: Optional[bool] = None


class SMTPConfigResponse(SMTPConfigBase):
    class Config(BaseModel):
        from_attributes = True


class ContactConfigBase(BaseModel):
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    wechat: Optional[str] = None
    business_hours: Optional[str] = None


class ContactConfigResponse(ContactConfigBase):
    class Config(BaseModel):
        from_attributes = True


class SystemSettingsResponse(BaseModel):
    smtp: SMTPConfigResponse
    contact: ContactConfigResponse
```

**Step 2: 运行测试验证**

Run: `cd apps/api && python -c "from app.schemas.schemas import SystemSettingsResponse; print('Schema OK')"`
Expected: 无错误输出

**Step 3: Commit**

```bash
git add apps/api/app/schemas/schemas.py
git commit -m "feat(api): add SystemSettings schemas"
```

---

## Task 4: 创建 Settings API 端点

**Files:**
- Create: `apps/api/app/api/v1/endpoints/admin_settings.py`

**Step 1: 编写 API 端点**

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_admin_user
from app.schemas.schemas import (
    SystemSettingsResponse,
    SMTPConfigBase,
    ContactConfigBase,
)
from app.db.models import SystemSetting, User

router = APIRouter()


def get_settings_by_category(db: Session, category: str) -> dict:
    settings = db.query(SystemSetting).filter(
        SystemSetting.category == category
    ).all()
    result = {}
    for s in settings:
        if s.value_type == "bool":
            result[s.key] = s.value.lower() == "true" if s.value else False
        elif s.value_type == "int":
            result[s.key] = int(s.value) if s.value else 0
        else:
            result[s.key] = s.value
    return result


def update_settings(db: Session, category: str, data: dict, user_id):
    for key, value in data.items():
        if value is None:
            continue
        setting = db.query(SystemSetting).filter(
            SystemSetting.category == category,
            SystemSetting.key == key
        ).first()
        if setting:
            str_value = str(value).lower() if isinstance(value, bool) else str(value)
            setting.value = str_value
            setting.updated_by_id = user_id
    db.commit()


@router.get("/", response_model=SystemSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    smtp = get_settings_by_category(db, "smtp")
    contact = get_settings_by_category(db, "contact")
    # 不返回 password
    smtp.pop("password", None)
    return {"smtp": smtp, "contact": contact}


@router.patch("/smtp", response_model=SMTPConfigBase)
def update_smtp_settings(
    data: SMTPConfigBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    update_settings(db, "smtp", data.model_dump(exclude_none=True), current_user.id)
    return get_settings_by_category(db, "smtp")


@router.patch("/contact", response_model=ContactConfigBase)
def update_contact_settings(
    data: ContactConfigBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    update_settings(db, "contact", data.model_dump(exclude_none=True), current_user.id)
    return get_settings_by_category(db, "contact")
```

**Step 2: 注册路由**

在 `admin_router.py` 中添加：

```python
from app.api.v1.endpoints.admin_settings import router as admin_settings_router

admin_router.include_router(
    admin_settings_router,
    prefix="/settings",
    tags=["admin-settings"]
)
```

**Step 3: 测试 API**

Run: `cd apps/api && uvicorn app.main:app --reload &`
等待启动后测试：
- GET `/api/v1/admin/settings/` (需要 admin token)
- PATCH `/api/v1/admin/settings/smtp`
- PATCH `/api/v1/admin/settings/contact`

**Step 4: Commit**

```bash
git add apps/api/app/api/v1/endpoints/admin_settings.py apps/api/app/api/v1/endpoints/admin_router.py
git commit -m "feat(api): add admin settings API endpoints"
```

---

## Task 5: 添加 Admin 菜单项

**Files:**
- Modify: `apps/web/src/components/admin/AdminSidebar.tsx`

**Step 1: 添加菜单项**

在 `navItems` 数组中添加：

```typescript
{
  href: "/admin/settings",
  label: t("nav.settings"),
  icon: <GearIcon className="h-5 w-5" />,
},
```

**Step 2: 添加国际化文本**

在 `zh.json` 添加 `"nav": { "settings": "系统设置" }`
在 `en.json` 添加 `"nav": { "settings": "Settings" }`

**Step 3: 验证构建**

Run: `cd apps/web && npm run build`
Expected: 无错误

**Step 4: Commit**

```bash
git add apps/web/src/components/admin/AdminSidebar.tsx apps/web/src/i18n/messages/zh.json apps/web/src/i18n/messages/en.json
git commit -m "feat(web): add Settings menu in admin sidebar"
```

---

## Task 6: 创建 Settings 页面

**Files:**
- Create: `apps/web/src/app/[locale]/admin/settings/page.tsx`

**Step 1: 创建页面组件**

创建包含 Tab 的设置页面组件，包含：
- "联系我们" Tab - 显示地址、电话、邮箱、微信、营业时间表单
- "SMTP 配置" Tab - 启用开关 + SMTP 配置表单

**Step 2: 验证页面**

Run: `cd apps/web && npm run dev`
访问 `/admin/settings` 确认页面加载正常

**Step 3: Commit**

```bash
git add apps/web/src/app/[locale]/admin/settings/page.tsx
git commit -m "feat(web): add admin settings page with SMTP and contact config"
```

---

## Task 7: 端到端测试

**Step 1: 测试流程**

1. 登录管理后台
2. 进入 Settings 页面
3. 修改联系信息并保存
4. 刷新页面确认保存成功
5. 切换到 SMTP Tab
6. 启用 SMTP 并填写配置
7. 保存并验证

**Step 2: 验证 API**

通过浏览器 DevTools 检查 API 调用是否正确

---

## 执行方式

**计划完成并保存至 `docs/plans/2026-05-08-settings-implementation.md`。两种执行方式：**

**1. Subagent-Driven (当前 session)** - 每个 Task 由 subagent 执行，任务间进行代码 review，快速迭代

**2. Parallel Session (独立 session)** - 在新的 worktree session 中使用 `executing-plans` 批量执行

选择哪种方式？
