# QC Department Technical Service Platform

**雅本化学 (Abachem)** QC部门技术服务平台，支持化学品台账管理和QC文献调研两大核心模块。

## 技术栈

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 + TailwindCSS v4 + i18n (zh-CN / en) |
| Backend | FastAPI + SQLAlchemy + Pydantic |
| Database | PostgreSQL + Alembic migrations |
| AI | LangChain + NotebookLM API |
| OCR | Tesseract + LLM post-processing |
| Storage | S3/MinIO |

## 项目结构

```
├── apps/
│   ├── web/              # Next.js 前端 (App Router)
│   │   ├── src/app/      # 页面路由 (locale-based i18n)
│   │   ├── src/components/  # React 组件
│   │   ├── src/lib/      # API 客户端、工具函数
│   │   ├── src/i18n/     # 中英文翻译
│   │   └── e2e/          # Playwright E2E 测试
│   └── api/              # FastAPI 后端
│       ├── app/
│       │   ├── api/v1/    # API 路由 (auth, ledgers, categories, users, research, notifications)
│       │   ├── core/      # 安全、配置
│       │   ├── db/        # SQLAlchemy 模型、会话
│       │   ├── schemas/   # Pydantic schemas
│       │   └── services/  # 业务逻辑 (ledger, ocr, notebooklm, storage, notification)
│       ├── alembic/       # 数据库迁移
│       └── tests/         # pytest 单元测试
├── packages/
│   └── shared/           # 共享类型、验证 schemas
└── docs/                 # PRD 和设计文档
```

## 核心功能

### 1. 化学品台账管理 (Chemical Reagent Ledger)

- **生命周期跟踪** — 试剂/实验溶液的全流程追踪
- **OCR 扫描** — 标签扫描自动录入
- **过期预警** — SOP 有效期计算与提醒
- **归档工作流** — 手动确认后归档

### 2. QC 深度文献调研 (QC Deep Research Assistant)

- **NotebookLM 集成** — 文献整理与问答
- **用量配额** — 普通用户 10次/日，Admin 无限制

## 数据库模型

| Table | Description |
|-------|-------------|
| Ledger | 试剂/实验溶液记录 |
| Category | 产品分类及 SOP 有效期规则 |
| User | 认证用户 (role: `user` \| `admin`) |
| Notification | 过期提醒与系统消息 |
| ResearchNotebook | NotebookLM notebook 引用 |
| DailyUsage | 文献调研用量追踪 |

### 内部批号格式

```
YYYYMMMNNN
├── YYYY = 4 位年份
├── MMM  = 3 位序号 (001-999)
└── NNN  = 2 位瓶号 (仅 qty > 1 时使用)
```

### 有效期计算

```
有效截止日 = MIN(SOP有效期截止日, 证书有效期截止日)
SOP有效期(开封) = 开封日期 + 品类.已开封有效期月数
SOP有效期(未开封) = 创建时间 + 品类.未开封有效期月数
```

## 权限矩阵

| Action | Anonymous | User | Admin |
|--------|:---------:|:----:|:-----:|
| View ledgers | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Create/edit own ledgers | :x: | :white_check_mark: | :white_check_mark: |
| Edit any ledger | :x: | :x: | :white_check_mark: |
| Archive ledgers | :x: | :white_check_mark: (own) | :white_check_mark: |
| User/Category management | :x: | :x: | :white_check_mark: |
| Deep Research | :x: | :white_check_mark: | :white_check_mark: |

## 快速开始

### 前置条件

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- pnpm

### 1. 安装依赖

```bash
# 安装 Node.js 和 Python 依赖
pnpm install

# 或分别安装
cd apps/web && pnpm install
cd apps/api && pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# apps/api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/qc_platform
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 数据库迁移

```bash
cd apps/api
alembic upgrade head
# 或创建新迁移
alembic revision --autogenerate -m "description"
```

### 4. 启动服务

```bash
# 开发模式 (根目录)
pnpm dev

# 分别启动
cd apps/web && pnpm dev   # http://localhost:3000
cd apps/api && uvicorn app.main:app --reload --port 8000
```

## 开发命令

### Frontend (Next.js)

```bash
cd apps/web
pnpm dev          # 开发服务器
pnpm build        # 生产构建
pnpm lint         # ESLint 检查
pnpm test:e2e     # Playwright E2E 测试
pnpm test:e2e:ui  # Playwright UI 模式
```

### Backend (FastAPI)

```bash
cd apps/api
uvicorn app.main:app --reload --port 8000  # 开发服务器
pytest                                      # 运行测试
alembic upgrade head                        # 数据库迁移
```

## API 路由

| Prefix | Description |
|--------|-------------|
| `/api/v1/auth` | 登录、注册、会话管理 |
| `/api/v1/ledgers` | 台账 CRUD |
| `/api/v1/categories` | 分类管理 |
| `/api/v1/users` | 用户管理 |
| `/api/v1/research` | NotebookLM 集成 |
| `/api/v1/notifications` | 过期提醒 |

## 重要说明

- **台账归档** — 所有台账需手动确认后方可归档
- **开封日期** — 一旦录入，触发 SOP 有效期重新计算
- **i18n** — 默认跟随用户系统语言，导航栏可切换