# Research Feature (深度调研) 功能说明

> **Architecture:** 研究功能是一个完整的 RAG (Retrieval-Augmented Generation) 系统，基于 NotebookLM 架构构建，包含笔记本管理、来源上传、聊天问答、内容生成四大模块。前端使用 Next.js + i18n，后端使用 FastAPI + SQLAlchemy + Gemini API。
>
> **Tech Stack:** Next.js (App Router), FastAPI, PostgreSQL, SQLAlchemy, Gemini API, SSE streaming

---

## 核心功能模块

### 1. Research Notebook (学术空间)

**数据模型:** `ResearchNotebook`
- `id`: UUID (主键)
- `user_id`: UUID (FK → users, 索引)
- `notebook_id`: String (客户端生成的 UUID，用于外部 NotebookLM ID)
- `name`: String (笔记本名称)
- `created_at`: DateTime

**限制规则:**
- 普通用户: 最多 3 个笔记本 (`NOTEBOOKS_LIMIT`)
- 管理员: 无限制

### 2. Research Source (来源/资料)

**数据模型:** `ResearchSource`
- `id`: UUID (主键)
- `notebook_id`: UUID (FK → research_notebooks, CASCADE 删除)
- `source_type`: Enum (PDF, URL, TEXT, VIDEO, AUDIO)
- `file_url`: Text (文件路径或 URL)
- `file_name`: String (原始文件名)
- `file_size`: Integer (字节)
- `status`: Enum (PENDING → PROCESSING → READY/ERROR)
- `notebooklm_id`: String (NotebookLM API 返回的 ID)
- `extra_data`: JSON (元数据、重试次数、错误信息)
- `created_at`: DateTime

**处理流程:**
1. 用户上传文件 → 状态设为 PENDING
2. `background_processor.process_single_source()` 后台任务:
   - 调用 `notebooklm_service.create_notebook()` 创建笔记本
   - 成功 → 状态设为 READY
   - 失败 → 重试最多 3 次后设为 ERROR

### 3. Chat (问答)

**API:** `POST /api/v1/research/chat` (SSE 流式响应)

**Quota 限制:**
- 普通用户: 每天 10 个问题 (`DAILY_QUESTION_LIMIT`)
- 管理员: 无限制
- `DailyUsage` 表跟踪使用量

**响应格式:** SSE 格式，包含 Gemini 生成的文本和 `[index: filename]` 格式的引用

### 4. Studio (内容生成)

三个子功能:

| 功能 | API | 返回格式 |
|------|-----|----------|
| Learning Guide | `POST /research/studio/learning-guide` | `{ title, sections: [{ heading, content }] }` |
| Mind Map | `POST /research/studio/mindmap` | `{ root: MindMapNode }` |
| PPT | `POST /research/studio/ppt` | `{ title, slides: [{ title, bulletPoints }] }` |

所有功能均使用 Gemini API (配置 `GEMINI_API_KEY` 时)，否则返回 mock 数据。

---

## 前端结构

```
apps/web/src/
├── app/[locale]/research/page.tsx          # 主研究页面 (3-panel 布局)
├── app/[locale]/admin/research-notebooks/  # 管理员笔记列表页
├── components/research/
│   ├── StudioPanel.tsx                     # 右侧: Learning Guide/Mind Map/PPT tab
│   ├── SourcesPanel.tsx                    # 左侧: 来源列表
│   ├── SourceUploadModal.tsx               # 上传/添加 URL 弹窗
│   ├── SourceCard.tsx                      # 单个来源卡片
│   ├── NewNotebookModal.tsx                # 创建笔记本弹窗
│   ├── LearningGuideView.tsx               # 学习指南渲染
│   ├── MindMapView.tsx + MindMapNode.tsx   # 思维导图 (SVG)
│   └── PPTView.tsx                         # PPT 大纲渲染
├── lib/
│   └── api-client.ts: researchApi          # API 客户端
└── i18n/messages/{en,zh}.json              # 国际化
```

## 后端结构

```
apps/api/
├── app/api/v1/
│   ├── research.py                         # 主路由 (所有 research 端点)
│   └── endpoints/admin_research_notebooks.py  # 管理员路由
├── app/services/
│   ├── research_service.py                 # 核心业务逻辑
│   ├── notebooklm_service.py               # NotebookLM API 封装
│   └── background_processor.py             # 异步处理任务
└── app/db/models.py                        # SQLAlchemy 模型
```

---

## API 端点总览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/research/quota` | 获取配额信息 |
| GET | `/research/notebooks` | 列出用户笔记本 |
| POST | `/research/notebooks` | 创建笔记本 |
| DELETE | `/research/notebooks/{notebook_id}` | 删除笔记本 |
| GET | `/research/sources/{notebook_id}` | 列出笔记本来源 |
| POST | `/research/sources/upload` | 上传文件 |
| POST | `/research/sources/add-url` | 添加 URL |
| DELETE | `/research/sources/{source_id}` | 删除来源 |
| POST | `/research/sources/{source_id}/process` | 手动触发处理 |
| POST | `/research/sources/process-pending` | 批量处理 (管理员) |
| GET | `/research/sources/{source_id}/status` | 获取处理状态 |
| POST | `/research/chat` | 流式问答 (SSE) |
| POST | `/research/studio/learning-guide` | 生成学习指南 |
| POST | `/research/studio/mindmap` | 生成思维导图 |
| POST | `/research/studio/ppt` | 生成 PPT |

### 管理后台 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/research-notebooks/` | 分页列出所有笔记本 |
| DELETE | `/admin/research-notebooks/{notebook_id}` | 删除笔记本 (管理员) |

---

## 关键实现细节

### SSE 流式响应 (`stream_chat_response`)
```python
# apps/api/app/services/research_service.py
async def stream_chat_response(notebook_id, question, sources):
    # sources 来自数据库的 ResearchSource 记录
    # 调用 Gemini API，格式化 citations 为 [index: filename]
    # 使用 async generator 产出 SSE 格式数据
```

### 背景处理 (`background_processor`)
```python
# apps/api/app/services/background_processor.py
async def process_single_source(source_id, db_session):
    MAX_RETRIES = 3
    # 非 HTTP URL 会被前缀 S3_ENDPOINT/S3_BUCKET
    # 调用 notebooklm_service.create_notebook()
```

### 配额检查
```python
# apps/api/app/api/v1/research.py
@router.post("/chat")
async def chat(request: ChatRequest, ...):
    # 检查 DailyUsage 表中今日使用量
    # 普通用户超过 DAILY_QUESTION_LIMIT (10) 则返回 429
```

---

## 配置环境变量

| 变量 | 说明 |
|------|------|
| `GEMINI_API_KEY` | Gemini API 密钥 (用于 chat 和 studio 生成) |
| `NOTEBOOKLM_API_KEY` | NotebookLM API 密钥 |
| `S3_ENDPOINT` | S3 端点 (用于构建完整文件 URL) |
| `S3_BUCKET` | S3 存储桶名 |
| `DAILY_QUESTION_LIMIT` | 每日问题限制 (默认 10) |
| `NOTEBOOKS_LIMIT` | 笔记本数量限制 (默认 3) |

---

## 数据库模型关系图

```
users
  └── ResearchNotebook (1:N, cascade delete)
        └── ResearchSource (1:N, cascade delete)

users
  └── DailyUsage (每日提问计数)
```