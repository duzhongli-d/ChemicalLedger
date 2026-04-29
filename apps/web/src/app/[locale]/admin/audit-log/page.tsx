"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { auditLogApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Pagination } from "@/components/layout/Pagination";

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
  USER_CREATE: "创建用户",
  USER_UPDATE: "更新用户",
};

export default function AuditLogPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const { isAdmin } = useAuthStore();

  const [actionFilter, setActionFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["audit-logs", actionFilter, startDate, endDate],
    queryFn: () =>
      auditLogApi.list({
        action: actionFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page_size: 100,
      }).then((r) => r.data),
    enabled: isAdmin(),
  });

  // Filter by action type (client-side)
  const filteredLogs = useMemo(() => {
    let filtered: AuditLog[] = Array.isArray(auditLogs) ? auditLogs : [];
    if (actionFilter) {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }
    return filtered;
  }, [auditLogs, actionFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (!isAdmin()) {
    return <div className="text-center py-12 text-red-500">需要管理员权限</div>;
  }

  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action] || action;
  };

  const formatDetails = (details: Record<string, unknown> | null) => {
    if (!details) return "-";
    if (typeof details === "object") {
      const parts: string[] = [];
      if (details.count !== undefined) parts.push(`数量: ${details.count}`);
      if (details.fields) parts.push(`字段: ${(details.fields as string[]).join(", ")}`);
      if (details.errors && Array.isArray(details.errors) && details.errors.length > 0) {
        parts.push(`错误: ${(details.errors as string[]).slice(0, 3).join(", ")}`);
      }
      return parts.length > 0 ? parts.join(", ") : JSON.stringify(details);
    }
    return String(details);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600">← {t("auditLogs") || "审计日志"}</Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("auditLogs") || "审计日志"}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        {/* Action Filter */}
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">全部操作</option>
          {Object.entries(ACTION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">日期:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <span className="text-gray-400">至</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Clear Filters */}
        {(actionFilter || startDate || endDate) && (
          <button
            onClick={() => {
              setActionFilter("");
              setStartDate("");
              setEndDate("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{tCommon("loading")}</div>
        ) : paginatedLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{tCommon("noData")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    { key: "createdAt", label: "时间" },
                    { key: "action", label: "操作" },
                    { key: "target", label: "目标" },
                    { key: "details", label: "详情" },
                    { key: "ip", label: "IP" },
                  ].map((h) => (
                    <th key={h.key} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    {/* Time */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {getActionLabel(log.action)}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="px-4 py-3 text-gray-500">
                      {log.target_type ? (
                        <span className="text-gray-700">
                          {log.target_type}
                          {log.target_id && (
                            <span className="ml-1 font-mono text-xs text-orange-500">
                              {String(log.target_id).slice(0, 8)}...
                            </span>
                          )}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Details */}
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={formatDetails(log.details)}>
                      {formatDetails(log.details)}
                    </td>

                    {/* IP */}
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredLogs.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}