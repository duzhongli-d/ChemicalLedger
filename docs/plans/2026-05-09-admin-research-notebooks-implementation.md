# Admin Research Notebooks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan.

**Goal:** Add admin management for research notebooks — list all users' notebooks and delete any notebook.

**Architecture:** New FastAPI endpoint router under admin, new React admin page with table UI.

**Tech Stack:** FastAPI + SQLAlchemy (backend), React Query + Tailwind (frontend)

---

## Critical Files

- Create: `apps/api/app/api/v1/endpoints/admin_research_notebooks.py`
- Create: `apps/web/src/app/[locale]/admin/research-notebooks/page.tsx`
- Modify: `apps/api/app/api/v1/endpoints/admin_router.py`
- Modify: `apps/web/src/components/admin/AdminSidebar.tsx`

---

## Task 1: Create Backend API Endpoint

**Files:**
- Create: `apps/api/app/api/v1/endpoints/admin_research_notebooks.py`
- Modify: `apps/api/app/api/v1/endpoints/admin_router.py`

### Step 1: Create admin_research_notebooks.py

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from app.db.session import get_db
from app.api.deps import get_admin_user
from app.db.models import ResearchNotebook, User
from pydantic import BaseModel

router = APIRouter()


class NotebookResponse(BaseModel):
    id: UUID
    notebook_id: str
    name: str
    user_id: UUID
    username: str
    created_at: str

    model_config = {"from_attributes": True}


class PaginatedNotebooks(BaseModel):
    items: List[NotebookResponse]
    total: int
    page: int
    page_size: int


@router.get("/", response_model=PaginatedNotebooks)
def list_notebooks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    query = db.query(ResearchNotebook).join(User)

    if search:
        query = query.filter(
            (ResearchNotebook.name.ilike(f"%{search}%")) |
            (User.username.ilike(f"%{search}%"))
        )

    total = query.count()
    items = (
        query.order_by(ResearchNotebook.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedNotebooks(
        items=[
            NotebookResponse(
                id=nb.id,
                notebook_id=nb.notebook_id,
                name=nb.name,
                user_id=nb.user_id,
                username=nb.user.username,
                created_at=nb.created_at.isoformat(),
            )
            for nb in items
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.delete("/{notebook_id}")
def delete_notebook(
    notebook_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
):
    nb = db.query(ResearchNotebook).filter(ResearchNotebook.id == notebook_id).first()
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")
    db.delete(nb)
    db.commit()
    return {"ok": True}
```

### Step 2: Register router in admin_router.py

Add to `admin_router.py` line 6 imports and line 15+ mount:

```python
from app.api.v1.endpoints import admin_dashboard, admin_users, admin_categories, admin_ledgers, admin_audit_logs, admin_contact, admin_annual_summaries, admin_settings, admin_research_notebooks
```

```python
admin_router.include_router(admin_research_notebooks.router, prefix="/research-notebooks", tags=["admin-research-notebooks"])
```

### Step 3: Verify the API works

Run:
```bash
curl -s "http://localhost:8000/api/v1/admin/research-notebooks/" \
  -H "Cookie: access_token=<admin_token>" | python -m json.tool
```

Expected: JSON with `{"items": [...], "total": N, "page": 1, "page_size": 20}`

---

## Task 2: Create Admin Sidebar Menu Item

**Files:**
- Modify: `apps/web/src/components/admin/AdminSidebar.tsx`

### Step 1: Add nav item

Add this item to the `navItems` array in `AdminSidebar.tsx` (put it near ledgers or between categories and audit-log):

```tsx
{
  href: "/admin/research-notebooks",
  label: "学术空间",
  icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
},
```

---

## Task 3: Create Admin Research Notebooks Page

**Files:**
- Create: `apps/web/src/app/[locale]/admin/research-notebooks/page.tsx`

### Step 1: Write the page

```tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import clsx from "clsx";

type Notebook = {
  id: string;
  notebook_id: string;
  name: string;
  user_id: string;
  username: string;
  created_at: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ResearchNotebooksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 20;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-notebooks", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        search: search || "",
      });
      const res = await fetch(`${apiUrl}/admin/research-notebooks/?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${apiUrl}/admin/research-notebooks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notebooks"] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const confirmDelete = (nb: Notebook) => {
    if (confirm(`确定删除学术空间 "${nb.name}"（属于 ${nb.username}）？该操作不可恢复，且会同时删除所有关联的来源文件。`)) {
      deleteMutation.mutate(nb.id);
    }
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) || 1 : 1;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">学术空间管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理所有用户的学术空间</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="搜索空间名称或用户名..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            搜索
          </button>
        </form>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-700">空间名称</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">所属用户</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">创建时间</th>
                <th className="text-right px-4 py-3 font-medium text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">加载中...</td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">暂无数据</td>
                </tr>
              ) : (
                data?.items?.map((nb: Notebook) => (
                  <tr key={nb.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{nb.name}</td>
                    <td className="px-4 py-3 text-slate-600">{nb.username}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {format(new Date(nb.created_at), "yyyy-MM-dd HH:mm")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => confirmDelete(nb)}
                        disabled={deleteMutation.isPending}
                        className={clsx(
                          "px-3 py-1.5 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-50 transition-colors",
                          deleteMutation.isPending && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {deleteMutation.isPending ? "删除中..." : "删除"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              共 {data?.total || 0} 条，第 {page} / {totalPages} 页
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
```

### Step 2: Verify the page renders

Navigate to `http://localhost:3000/admin/research-notebooks` as admin. Confirm:
1. The sidebar shows "学术空间" menu item
2. The page loads and shows a table with notebook rows
3. Search input filters results
4. Delete button opens confirm dialog

---

## Task 4: Commit

```bash
git add apps/api/app/api/v1/endpoints/admin_research_notebooks.py
git add apps/api/app/api/v1/endpoints/admin_router.py
git add apps/web/src/app/[locale]/admin/research-notebooks/
git add apps/web/src/components/admin/AdminSidebar.tsx
git commit -m "feat(admin): add research notebooks management page"
```
