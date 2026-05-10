# ResearchSource 后台处理流程实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现后台处理流程，调用 NotebookLM API 为上传的来源文件创建 notebook，并将状态从 PENDING 更新为 READY。

**Architecture:** 使用 FastAPI 的 `BackgroundTasks` 在来源创建时立即触发处理，同时提供手动触发端点用于重试/批量处理。由于没有 Celery/Redis，采用纯异步 HTTP 调用 + 同步 DB 的混合模式。

**Tech Stack:** FastAPI, SQLAlchemy (sync), httpx (async), BackgroundTasks

---

## 背景问题

ResearchSource 模型已有完整的状态流转定义（PENDING → PROCESSING → READY/ERROR），但从 PENDING 到 READY 的处理流程**未实现**：
- `notebooklm_service.create_notebook()` 已定义但从未被调用
- `update_source_status()` 已定义但从未触发
- 来源文件上传后永远停留在"待处理"状态

---

## 关键文件（复用）

| 文件 | 用途 |
|------|------|
| `apps/api/app/services/notebooklm_service.py` | `create_notebook(file_url, name)` - 已有 |
| `apps/api/app/services/research_service.py` | `update_source_status()`, `get_source()` - 已有 |
| `apps/api/app/db/models.py` | `ResearchSource`, `ResearchSourceStatus` - 已有 |
| `apps/api/app/core/config.py` | `get_settings()` - 已有 |

---

## 实现步骤

### Task 1: 创建 `apps/api/app/services/background_processor.py`

**目的:** 核心处理逻辑：错误处理、重试机制

**Step 1: 创建文件** (新文件)

```python
# apps/api/app/services/background_processor.py
import uuid
import httpx
from sqlalchemy.orm import Session

from app.db.models import ResearchSource, ResearchSourceStatus
from app.services.research_service import update_source_status, get_source
from app.services.notebooklm_service import create_notebook
from app.core.config import get_settings

MAX_RETRIES = 3


async def process_single_source(source_id: uuid.UUID, db_session: Session) -> None:
    """处理单个 PENDING 来源：调用 NotebookLM，更新状态"""
    source = get_source(db_session, source_id)
    if not source:
        return

    if source.status != ResearchSourceStatus.PENDING:
        return

    # 标记为处理中
    update_source_status(db_session, source_id, ResearchSourceStatus.PROCESSING)

    settings = get_settings()
    file_url = source.file_url
    if file_url and not file_url.startswith("http"):
        file_url = f"{settings.S3_ENDPOINT}/{settings.S3_BUCKET}/{source.file_url}"

    retries = (source.extra_data or {}).get("retries", 0)

    try:
        result = await create_notebook(file_url=file_url, name=source.file_name or "Untitled")
        notebooklm_id = result.get("id") or result.get("notebook_id")
        if not notebooklm_id:
            raise ValueError("No notebook ID returned from NotebookLM API")

        update_source_status(
            db_session, source_id,
            ResearchSourceStatus.READY,
            notebooklm_id=notebooklm_id
        )
    except Exception as e:
        _handle_error(db_session, source, retries, str(e))


def _handle_error(db: Session, source: ResearchSource, retries: int, message: str):
    """错误处理：重试或标记为 ERROR"""
    if retries < MAX_RETRIES:
        source.status = ResearchSourceStatus.PENDING
        source.extra_data = {
            **(source.extra_data or {}),
            "retries": retries + 1,
            "last_error": message
        }
    else:
        source.status = ResearchSourceStatus.ERROR
        source.extra_data = {
            **(source.extra_data or {}),
            "last_error": message,
            "failed": True
        }
    db.commit()
```

**Step 2: 提交** - git add + commit

---

### Task 2: 修改 `apps/api/app/api/v1/research.py`

**目的:** 添加触发端点，在来源创建时自动触发处理

**Step 1: 添加导入和端点**

```python
from fastapi import BackgroundTasks
from app.services.background_processor import process_single_source
```

**Step 2: 添加三个端点**

```python
@router.post("/sources/{source_id}/process")
async def trigger_source_processing(
    source_id: UUID,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user_required),
):
    """手动触发单个来源的 NotebookLM 处理"""
    source = db.query(ResearchSource).filter(ResearchSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    notebook = db.query(ResearchNotebook).filter(
        ResearchNotebook.id == source.notebook_id,
        ResearchNotebook.user_id == current_user.id,
    ).first()
    if not notebook:
        raise HTTPException(status_code=403, detail="Not authorized")

    if source.status == ResearchSourceStatus.READY:
        return {"message": "Already processed", "notebooklm_id": source.notebooklm_id}

    # ERROR 状态手动重置
    if source.status == ResearchSourceStatus.ERROR:
        source.status = ResearchSourceStatus.PENDING
        source.extra_data = {**(source.extra_data or {}), "retries": 0}
        db.commit()

    background_tasks.add_task(process_single_source, source_id, db)
    return {"message": "Processing started"}


@router.post("/sources/process-pending")
async def trigger_all_pending(
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user_required),
):
    """批量触发所有 PENDING 来源的处理（管理员）"""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only")

    pending = db.query(ResearchSource).filter(
        ResearchSource.status == ResearchSourceStatus.PENDING
    ).all()

    for source in pending:
        background_tasks.add_task(process_single_source, source.id, db)

    return {"message": f"Queued {len(pending)} sources"}


@router.get("/sources/{source_id}/status")
def get_source_status(
    source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
):
    """获取来源的当前处理状态"""
    source = db.query(ResearchSource).filter(ResearchSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return {
        "status": source.status,
        "notebooklm_id": source.notebooklm_id,
        "extra_data": source.extra_data,
    }
```

**Step 3: 在 `upload_source` 和 `add_url_source` 创建来源后添加:**
```python
background_tasks.add_task(process_single_source, source.id, db)
```

**Step 4: 提交**

---

### Task 3: 添加 `get_pending_sources()` 到 `research_service.py`

**Step 1: 添加函数**

```python
def get_pending_sources(db: Session) -> list[ResearchSource]:
    return db.query(ResearchSource).filter(
        ResearchSource.status == ResearchSourceStatus.PENDING
    ).all()
```

**Step 2: 提交**

---

## ⚠️ 待确认: NotebookLM API 响应格式

`notebooklm_service.create_notebook()` 返回 `response.json()`，但需要确认响应中 notebook ID 的字段名是 `id` 还是 `notebook_id` 或其他。实现时需对照 [NotebookLM API 文档](https://developers.google.com/notebooklm) 确认响应格式。

---

## 验证方式

1. **端到端测试:**
   - 上传一个 PDF 文件到 notebook
   - 确认来源状态从 PENDING → PROCESSING → READY
   - 确认 `notebooklm_id` 已填充

2. **错误场景测试:**
   - 模拟 NotebookLM API 失败，确认 ERROR 状态
   - 确认 `extra_data.last_error` 有值

3. **手动触发测试:**
   - 调用 `POST /sources/{id}/process` 确认能重试 ERROR 状态的来源

---

## NotebookLM API 注意事项

`create_notebook()` 返回的 JSON 结构需要确认。根据 httpx 调用模式，返回 `response.json()` 后需要提取 `id` 或 `notebook_id` 字段。如果 API 响应结构不同，需要调整 `result.get("id")` 的字段名。