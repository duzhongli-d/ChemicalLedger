# Settings 管理后台设计文档

**日期：** 2026-05-08
**状态：** 已批准

---

## 1. 概述

在管理后台增加 Settings 菜单，提供 SMTP 邮箱配置、联系信息配置功能。AI 相关配置保持 `.env` 现状不做改动。

---

## 2. 存储策略（混合模式）

| 配置类别 | 存储位置 | 说明 |
|----------|----------|------|
| SMTP 配置 | 数据库 | 运行时可改 |
| 联系信息 | 数据库 | 运行时可改 |
| AI 配置 | `.env` | 保持现状 |

---

## 3. 数据库设计

### 3.1 SystemSettings 表

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    value_type VARCHAR(20) DEFAULT 'string',
    is_secret BOOLEAN DEFAULT FALSE,
    description VARCHAR(255),
    updated_by_id UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, key)
);
```

### 3.2 SMTP 配置项 (category='smtp')

| key | value_type | 说明 |
|-----|------------|------|
| `enabled` | bool | 是否启用 SMTP |
| `host` | string | 服务器地址 |
| `port` | int | 端口号 |
| `username` | string | 用户名 |
| `password` | string | 密码（is_secret=true） |
| `sender_email` | string | 发件人邮箱 |
| `sender_name` | string | 发件人名称 |
| `use_tls` | bool | 是否启用 TLS |

### 3.3 联系信息配置项 (category='contact')

| key | value_type | 说明 |
|-----|------------|------|
| `address` | string | 公司地址 |
| `phone` | string | 联系电话 |
| `email` | string | 客服邮箱 |
| `wechat` | string | 微信公众号 |
| `business_hours` | string | 营业时间 |

---

## 4. API 设计

**路由前缀：** `/api/v1/admin/settings`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 获取所有设置（按 category 分组） |
| PATCH | `/smtp` | 更新 SMTP 配置 |
| PATCH | `/contact` | 更新联系信息 |

**GET 响应示例：**
```json
{
  "smtp": {
    "enabled": true,
    "host": "smtp.example.com",
    "port": 587,
    "username": "noreply@example.com",
    "sender_email": "noreply@example.com",
    "sender_name": "Chemical Ledger",
    "use_tls": true
  },
  "contact": {
    "address": "北京市朝阳区...",
    "phone": "400-xxx-xxxx",
    "email": "support@example.com",
    "wechat": "",
    "business_hours": "周一至周五 9:00-18:00"
  }
}
```

**PATCH 请求示例 (smtp)：**
```json
{
  "enabled": true,
  "host": "smtp.gmail.com",
  "port": 587,
  "username": "user@gmail.com",
  "password": "app-password",
  "sender_email": "user@gmail.com",
  "sender_name": "Chemical Ledger",
  "use_tls": true
}
```

**安全说明：** 密码字段 `is_secret=true`，API 返回时不包含密码

---

## 5. 前端 UI 设计

### 5.1 菜单

`AdminSidebar.tsx` 新增菜单项：
- 路由：`/admin/settings`
- 图标：Settings (GearIcon)

### 5.2 页面布局

**路由：** `/admin/settings/page.tsx`

使用 Tab 切换两个配置块：

```
┌─────────────────────────────────────────────┐
│  系统设置                                   │
├─────────────────────────────────────────────┤
│  [联系我们]              [SMTP 配置]       │  ← Tab
├─────────────────────────────────────────────┤
│                                             │
│  地址: [________________________]           │
│  电话: [________________________]           │
│  邮箱: [________________________]          │
│  微信: [________________________]          │
│  营业时间: [____________________]          │
│                                             │
│  [保存修改]                                 │
└─────────────────────────────────────────────┘
```

SMTP Tab：
- 顶部「启用 SMTP」开关
- 开关关闭时隐藏表单
- 开关开启时显示完整 SMTP 表单

---

## 6. 关键文件

| 用途 | 文件路径 |
|------|----------|
| 数据库模型 | `apps/api/app/db/models.py` |
| Pydantic Schema | `apps/api/app/schemas/schemas.py` |
| API 端点 | `apps/api/app/api/v1/endpoints/admin_settings.py` |
| 路由注册 | `apps/api/app/api/v1/endpoints/admin_router.py` |
| Admin 侧边栏 | `apps/web/src/components/admin/AdminSidebar.tsx` |
| Settings 页面 | `apps/web/src/app/[locale]/admin/settings/page.tsx` |
| Alembic 迁移 | `apps/api/alembic/versions/xxxx_add_system_settings_table.py` |

---

## 7. 实现步骤（概述）

1. 创建 Alembic 迁移添加 `system_settings` 表
2. 在 `models.py` 添加 `SystemSetting` 模型
3. 在 `schemas.py` 添加相关 Pydantic Schema
4. 创建 `admin_settings.py` API 端点
5. 在 `admin_router.py` 注册新路由
6. 在 `AdminSidebar.tsx` 添加 Settings 菜单项
7. 创建 `admin/settings/page.tsx` 页面组件
8. 测试验证

---

## 8. 设计原则

- **安全性**：SMTP 密码加密存储，API 不返回明文
- **可扩展性**：`category + key` 结构支持后续添加新配置项
- **审计追踪**：更新设置时记录 AuditLog
- **用户体验**：SMTP 启用/禁用开关允许临时关闭而不丢失配置
