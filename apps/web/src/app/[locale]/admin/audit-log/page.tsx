"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { auditLogApi } from "@/lib/api-client";

const PAGE_SIZE = 50;

interface AuditLog {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_id: string | null;
  created_at: string;
  user?: { username: string };
}

interface User {
  id: string;
  username: string;
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "登录",
  LOGOUT: "退出登录",
  LEDGER_CREATE: "创建台账",
  LEDGER_UPDATE: "更新台账",
  LEDGER_ARCHIVE: "归档台账",
  LEDGER_BATCH_ARCHIVE: "批量归档台账",
  CATEGORY_CREATE: "创建品类",
  CATEGORY_UPDATE: "更新品类",
  CATEGORY_DELETE: "删除品类",
  USER_CREATE: "创建用户",
  USER_UPDATE: "更新用户",
  USER_DELETE: "删除用户",
  USER_IMPORT: "导入用户",
  admin_reset_password: "重置密码",
};

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch users for filter dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users-minimal"],
    queryFn: () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      return fetch(`${apiUrl}/admin/users/?page=1&page_size=100`, {
        credentials: "include",
      }).then((r) => r.json());
    },
  });

  // Fetch audit logs
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["audit-logs", actionFilter, userFilter, startDate, endDate, currentPage],
    queryFn: () =>
      auditLogApi.list({
        action: actionFilter || undefined,
        user_id: userFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page: currentPage,
        page_size: PAGE_SIZE,
      }).then((r) => r.data),
  });

  // Filter by action type (client-side additional filter if needed)
  const filteredLogs = useMemo(() => {
    let filtered: AuditLog[] = Array.isArray(auditLogs) ? auditLogs : [];
    if (actionFilter) {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }
    if (userFilter) {
      filtered = filtered.filter((log) => log.user_id === userFilter);
    }
    return filtered;
  }, [auditLogs, actionFilter, userFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action] || action;
  };

  const formatDetails = (details: Record<string, unknown> | null) => {
    if (!details) return "-";
    if (typeof details === "object") {
      const parts: string[] = [];
      if (details.count !== undefined) parts.push(`数量: ${details.count}`);
      if (details.fields) parts.push(`字段: ${(details.fields as string[]).join(", ")}`);
      if (details.errors && Array.isArray(details.errors) && (details.errors as string[]).length > 0) {
        parts.push(`错误: ${(details.errors as string[]).slice(0, 3).join(", ")}`);
      }
      if (details.success !== undefined) parts.push(`成功: ${details.success}`);
      if (details.skipped !== undefined) parts.push(`跳过: ${details.skipped}`);
      if (details.username !== undefined) parts.push(`用户: ${details.username}`);
      return parts.length > 0 ? parts.join(", ") : JSON.stringify(details);
    }
    return String(details);
  };

  const handleExportCSV = () => {
    const headers = ["时间", "用户", "操作", "目标类型", "目标ID", "详情", "IP地址"];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
      log.user?.username || log.user_id || "-",
      getActionLabel(log.action),
      log.target_type || "-",
      log.target_id || "-",
      formatDetails(log.details),
      log.ip_address || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `审计日志_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setActionFilter("");
    setUserFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const hasFilters = actionFilter || userFilter || startDate || endDate;

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
        .font-body-custom { font-family: 'IBM Plex Sans', sans-serif; }
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes headerSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes tableRowEnter {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .card-enter { animation: cardEnter 0.5s ease-out forwards; opacity: 0; }
        .header-slide { animation: headerSlideIn 0.4s ease-out forwards; }
        .table-row-enter { animation: tableRowEnter 0.3s ease-out forwards; opacity: 0; }
      `}</style>

      <div className="space-y-6 font-body-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 header-slide">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 font-mono-custom tracking-tight">
              审计日志
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent rounded"></span>
              <span className="text-xs text-slate-500 font-mono-custom">AUDIT LOG</span>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 card-enter" style={{ animationDelay: "0.1s" }}>
          {/* Action Filter */}
          <div>
            <label className="block text-xs text-slate-500 mb-1 font-mono-custom">操作类型</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="admin-select font-mono-custom"
            >
              <option value="">全部操作</option>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-xs text-slate-500 mb-1 font-mono-custom">用户</label>
            <select
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="admin-select font-mono-custom"
            >
              <option value="">全部用户</option>
              {(users as User[]).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs text-slate-500 mb-1 font-mono-custom">开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="admin-input font-mono-custom"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1 font-mono-custom">结束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="admin-input font-mono-custom"
            />
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm self-end font-mono-custom"
            >
              清除筛选
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden card-enter" style={{ animationDelay: "0.2s" }}>
          {/* Gradient accent bar */}
          <div className="h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent"></div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500 font-mono-custom">加载中...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">暂无数据</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap font-mono-custom text-xs">
                      时间
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap font-mono-custom text-xs">
                      用户
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap font-mono-custom text-xs">
                      操作
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap font-mono-custom text-xs">
                      目标
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap font-mono-custom text-xs">
                      详情
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap font-mono-custom text-xs">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log, index) => (
                    <tr
                      key={log.id}
                      className="hover:bg-blue-50/50 transition-colors table-row-enter"
                      style={{ animationDelay: `${0.3 + index * 0.03}s` }}
                    >
                      {/* Time */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs font-mono-custom">
                        {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900 font-mono-custom">
                          {log.user?.username || "-"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 bg-[#f97316]/10 text-[#f97316] rounded text-xs font-medium font-mono-custom">
                          {getActionLabel(log.action)}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-4 py-3 text-slate-600">
                        {log.target_type ? (
                          <div>
                            <span className="text-slate-700">{log.target_type}</span>
                            {log.target_id && (
                              <span className="ml-1 font-mono text-xs text-slate-400">
                                {String(log.target_id).slice(0, 8)}
                              </span>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate text-xs" title={formatDetails(log.details)}>
                        {formatDetails(log.details)}
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                        {log.ip_address || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4">
            <div className="text-sm text-slate-600 font-mono-custom">
              共 {filteredLogs.length} 条记录
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-mono-custom"
              >
                上一页
              </button>
              <span className="px-3 py-1 text-sm text-slate-600 font-mono-custom">
                第 {currentPage} / {totalPages} 页
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-mono-custom"
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