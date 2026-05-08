"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import clsx from "clsx";

type ResearchNotebook = {
  id: string;
  notebook_id: string;
  name: string;
  user_id: string;
  username: string;
  created_at: string;
};

type NotebooksResponse = {
  items: ResearchNotebook[];
  total: number;
  page: number;
  page_size: number;
};

function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center card-enter">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">暂无学术空间</h3>
      <p className="text-sm text-slate-500">当前系统中还没有创建任何学术空间</p>
    </div>
  );
}

export default function AdminResearchNotebooksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-research-notebooks", page, search],
    queryFn: () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        search: search || "",
      });
      return fetch(
        `${apiUrl}/admin/research-notebooks/?${params.toString()}`,
        { credentials: "include" }
      ).then((r) => r.json());
    },
  });

  const notebooks: ResearchNotebook[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/research-notebooks/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      ).then((r) => {
        if (!r.ok) throw new Error("删除失败");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-research-notebooks"] });
      setActionMsg("学术空间已删除");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: () => setActionMsg("删除失败"),
  });

  const handleSearch = () => {
    setPage(1);
  };

  const handleDelete = (nb: ResearchNotebook) => {
    if (confirm(`确定删除学术空间 "${nb.name}"（属于 ${nb.username}）？该操作不可恢复，且会同时删除所有关联的来源文件。`)) {
      deleteMutation.mutate(nb.id);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background font-body-custom">
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8 header-slide">
            <h1 className="text-2xl font-semibold text-slate-900 font-mono-custom tracking-tight">
              学术空间管理
            </h1>
            <p className="text-sm text-slate-500 font-mono-custom mt-1">管理所有用户的学术空间</p>
          </div>

          {/* Action message */}
          {actionMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 card-enter">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {actionMsg}
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 card-enter">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="搜索空间名称或用户名..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono-custom"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium font-mono-custom transition-all flex items-center gap-2 shadow-sm shadow-blue-600/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              搜索
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden card-enter">
            {isLoading ? (
              <div className="divide-y divide-slate-100">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-5 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-32" />
                        <div className="h-3 bg-slate-200 rounded w-24" />
                      </div>
                      <div className="h-4 bg-slate-200 rounded w-20" />
                      <div className="h-8 bg-slate-200 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notebooks.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono-custom">
                        空间名称
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono-custom">
                        所属用户
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono-custom">
                        创建时间
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono-custom">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notebooks.map((nb, index) => (
                      <tr
                        key={nb.id}
                        className="hover:bg-slate-50 transition-colors"
                        style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-slate-900 font-mono-custom truncate max-w-[200px]">
                              {nb.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-600 font-mono-custom">
                            {nb.username}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-500 font-mono-custom">
                            {nb.created_at ? format(new Date(nb.created_at), "yyyy-MM-dd HH:mm") : "-"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleDelete(nb)}
                            disabled={deleteMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all font-mono-custom disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500 font-mono-custom">
                      共 {total} 条，第 {page} / {totalPages} 页
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className={clsx(
                          "px-3 py-1.5 text-sm rounded-lg border font-mono-custom transition-all",
                          page <= 1
                            ? "border-slate-200 text-slate-400 cursor-not-allowed"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className={clsx(
                          "px-3 py-1.5 text-sm rounded-lg border font-mono-custom transition-all",
                          page >= totalPages
                            ? "border-slate-200 text-slate-400 cursor-not-allowed"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}