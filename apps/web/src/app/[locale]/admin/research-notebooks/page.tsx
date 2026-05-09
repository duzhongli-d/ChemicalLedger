"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, isAfter } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { Pagination } from "@/components/layout/Pagination";
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
    <div className="px-6 py-16 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1 font-mono-custom">暂无学术空间</h3>
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

  // Compute stats from notebooks
  const stats = useMemo(() => {
    const allNotebooks = data?.items ?? [];
    const uniqueUsers = new Set(allNotebooks.map((n: ResearchNotebook) => n.user_id)).size;
    const monthStart = startOfMonth(new Date());
    const thisMonthNew = allNotebooks.filter((n: ResearchNotebook) =>
      n.created_at && isAfter(new Date(n.created_at), monthStart)
    ).length;
    return {
      total: total,
      uniqueUsers,
      thisMonthNew,
    };
  }, [data, total]);

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
        .font-body-custom { font-family: 'IBM Plex Sans', sans-serif; }
        @keyframes headerSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .header-slide { animation: headerSlideIn 0.4s ease-out forwards; }
        .card-enter { animation: cardEnter 0.5s ease-out forwards; opacity: 0; }
      `}</style>

      <div className="min-h-screen bg-background font-body-custom">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 header-slide">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 font-mono-custom tracking-tight">
                学术空间管理
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent rounded"></span>
                <span className="text-xs text-slate-500 font-mono-custom">RESEARCH NOTEBOOKS</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 card-enter" style={{ animationDelay: "0.05s" }}>
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">总记录数</p>
                <p className="text-2xl font-semibold font-mono-custom text-slate-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">用户数 / Users</p>
                <p className="text-2xl font-semibold font-mono-custom text-slate-900">{stats.uniqueUsers}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">本月新增</p>
                <p className="text-2xl font-semibold font-mono-custom text-purple-600">{stats.thisMonthNew}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
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
          <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 card-enter" style={{ animationDelay: "0.1s" }}>
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden card-enter" style={{ animationDelay: "0.15s" }}>
            {isLoading ? (
              <div className="px-6 py-16 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-sm text-slate-500 font-mono-custom">加载中...</p>
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
                        className="hover:bg-blue-500/[0.02] transition-colors"
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
                  <div className="card-enter" style={{ animationDelay: "0.2s" }}>
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      totalItems={total}
                      pageSize={pageSize}
                      onPageChange={(p) => setPage(p)}
                    />
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