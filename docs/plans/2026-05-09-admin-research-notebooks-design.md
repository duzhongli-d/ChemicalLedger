# 学术空间管理后台设计

## Context

当前管理后台没有学术空间（Research Notebooks）的任何管理功能。管理员无法查看或删除任意用户的学术空间。后端已有 `DELETE /research/notebooks/{notebook_id}` 接口（自删除，用户只能删除自己的），但没有管理员专用的删除接口，也没有后台 UI。

需求：管理员能删除任意用户的学术空间，拥有完全自主决定权。

---

## 设计方案：新增「学术空间」管理模块

### 模块位置

在管理后台左侧导航新增「学术空间」菜单项，路径 `/admin/research-notebooks`。

**理由**：
- 学术空间是独立实体，与台账/品类/用户不同维度
- 管理员需要全局视图快速浏览和搜索任意用户的空间
- 放在"用户管理"里操作路径太长，且无法全局俯瞰

---

### 后端 API 设计

新建 `apps/api/app/api/v1/endpoints/admin_research_notebooks.py`，挂载到 `admin_router.py`。

**GET /admin/research-notebooks**
- Query params: `page`, `page_size`, `search`（按 notebook name 或 username 搜索）
- Response: 分页列表，包含 notebook 信息 + 关联的 user 信息
- 需要 admin role 验证（参考 `admin_users.py` 的权限模式）

**DELETE /admin/research-notebooks/{notebook_id}**
- 直接硬删除（参考 `admin_annual_summaries.py` 的直接删除模式）
- 删除时会级联删除关联的 `research_sources` 记录
- 返回 `{"ok": true}` 或 404

---

### 前端 UI 设计

页面路径：`apps/web/src/app/[locale]/admin/research-notebooks/page.tsx`

表格列：

| 列 | 说明 |
|----|------|
| Notebook Name | 学术空间名称 |
| Owner | 所属用户 |
| Created At | 创建时间 |
| Actions | 删除按钮（红色危险操作） |

**功能**：
- 支持按空间名或用户名搜索
- 分页展示（每页 20 条）
- 删除时弹出确认对话框，提示"该操作不可恢复，且会同时删除所有关联的来源文件"

---

### 数据流

1. 管理员进入 `/admin/research-notebooks`
2. 页面加载时调用 `GET /admin/research-notebooks`
3. 显示所有用户的学术空间列表
4. 点击删除 → 弹出确认框 → 确认后调用 `DELETE /admin/research-notebooks/{id}`
5. 删除成功后，表格自动刷新（React Query invalidation）

---

### 关键文件

| 操作 | 文件 |
|------|------|
| 新建 | `apps/api/app/api/v1/endpoints/admin_research_notebooks.py` |
| 新建 | `apps/web/src/app/[locale]/admin/research-notebooks/page.tsx` |
| 修改 | `apps/api/app/api/v1/endpoints/admin_router.py` — 挂载新 router |
| 修改 | `apps/web/src/components/admin/AdminSidebar.tsx` — 添加菜单项 |

---

### 验证方式

1. 以管理员身份登录
2. 访问 `/admin/research-notebooks`，确认能看到所有用户的学术空间列表
3. 点击某个空间的删除按钮，确认对话框出现
4. 确认删除后，空间从列表消失
5. 确认删除后，该用户在 /research 页面的下拉列表中不再看到该空间
