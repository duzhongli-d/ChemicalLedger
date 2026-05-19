# 分布式部署配置修改计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan.

**Goal:** 将 Web、API、Database 分别部署在不同服务器上，修改相关配置使其能正常通信。

**Architecture:** 当前为单体开发环境（Web/API/Database 均在 localhost）。分布式部署后，三者通过 IP/域名通信，主要涉及跨域、数据库连接、API URL 等配置。

**Tech Stack:** Next.js (Web) + FastAPI (API) + PostgreSQL (Database)

---

## 任务总览

| 序号 | 任务 | 涉及文件 |
|------|------|----------|
| 1 | 修改 API CORS 配置 | `apps/api/app/main.py` |
| 2 | 修改 API 数据库连接 | `apps/api/.env`, `apps/api/app/core/config.py`, `apps/api/alembic.ini` |
| 3 | 修改 Web API 指向 | `apps/web/.env`, `apps/web/next.config.ts` |

---

## Task 1: 修改 API CORS 配置

**问题:** 当前 CORS 硬编码为 `localhost:3000`，分布式环境下需改为实际 Web 域名/IP。

**文件:** `apps/api/app/main.py:17-24`

**当前代码:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "Content-Type"],
)
```

**Step 1: 添加 CORS_ORIGINS 环境变量**

在 `apps/api/app/core/config.py` 的 `Settings` 类中添加（现有字段之后）:
```python
CORS_ORIGINS: list[str] = ["http://localhost:3000"]
```

在 `apps/api/.env` 中添加:
```
CORS_ORIGINS=["http://localhost:3000","http://your-web-domain.com"]
```

**Step 2: 修改 main.py 使用环境变量**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "Content-Type"],
)
```

---

## Task 2: 修改 API 数据库连接

**问题:** 当前数据库连接指向 `localhost:5432`，需改为实际数据库服务器地址。

**Step 1: 修改 `.env`**

**文件:** `apps/api/.env`

将 `DATABASE_URL` 改为实际数据库服务器地址:
```
# 开发环境
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/qc_platform

# 分布式部署（示例）
# DATABASE_URL=postgresql://user:password@192.168.1.100:5432/qc_platform
# DATABASE_URL=postgresql://user:password@db.example.com:5432/qc_platform
```

**Step 2: 修改 `alembic.ini`**

**文件:** `apps/api/alembic.ini`

```ini
# sqlalchemy.url = postgresql://postgres:postgres123@localhost:5432/qc_platform
sqlalchemy.url = postgresql://user:password@192.168.1.100:5432/qc_platform
```

---

## Task 3: 修改 Web 端 API 指向

**问题:** Web 应用需指向远程 API 服务器而非本地。

**Step 1: 修改 `.env`**

**文件:** `apps/web/.env`

```
# 开发环境
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# 分布式部署
NEXT_PUBLIC_API_URL=http://api.example.com/api/v1
```

**Step 2: 修改 `next.config.ts`**

**文件:** `apps/web/next.config.ts`

更新 `env` 配置为:
```typescript
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
},
```

---

## 验证步骤

1. **API 验证:** 访问 `http://api.example.com/docs` 检查 CORS 响应头
2. **Web 验证:** 浏览器开发者工具 Network 面板检查 API 请求是否到达远程 API
3. **数据库验证:** 在 API 服务器上执行 `psql $DATABASE_URL` 确认连接

---

## 分布式部署示例值

| 服务 | 示例 URL/地址 |
|------|--------------|
| Web | `http://192.168.1.10:3000` 或 `https://web.example.com` |
| API | `http://192.168.1.20:8000` |
| Database | `192.168.1.30:5432` |
| CORS_ORIGINS | `["http://192.168.1.10:3000"]` 或 `["https://web.example.com"]` |