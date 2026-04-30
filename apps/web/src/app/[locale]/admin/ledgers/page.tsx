"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminLedgerApi } from "@/lib/api-client";

const PAGE_SIZE = 20;

interface Ledger {
  id: string;
  internal_batch_no: string;
  product_name: string;
  batch_no: string;
  cas_no: string;
  weight_capacity: string;
  supplier: string;
  quantity: number;
  category: { level1: string; level2: string };
  cert_expiry_date: string;
  effective_expiry_date: string;
  status: "active" | "archived";
  created_at: string;
  created_by_id: string;
  creator?: { username: string };
}

export default function AdminLedgersPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: ledgers = [], isLoading } = useQuery({
    queryKey: ["admin-ledgers"],
    queryFn: () => adminLedgerApi.list({ page_size: 100 }).then((r) => r.data),
  });

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>();
    ledgers.forEach((l: Ledger) => {
      if (l.category?.level2) cats.add(l.category.level2);
    });
    return Array.from(cats).sort();
  }, [ledgers]);

  // Filter ledgers
  const filteredLedgers = useMemo(() => {
    let filtered: Ledger[] = Array.isArray(ledgers) ? ledgers : [];

    if (statusFilter) {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter((l) => l.category?.level2 === categoryFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.product_name?.toLowerCase().includes(q) ||
          l.internal_batch_no?.toLowerCase().includes(q) ||
          l.batch_no?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [ledgers, statusFilter, categoryFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredLedgers.length / PAGE_SIZE);
  const paginatedLedgers = filteredLedgers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (id: string) => adminLedgerApi.update(id, { status: "archived" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ledgers"] });
      setSelectedIds(new Set());
    },
  });

  // Batch archive mutation
  const batchArchiveMutation = useMutation({
    mutationFn: (ids: string[]) => adminLedgerApi.batchArchive(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ledgers"] });
      setSelectedIds(new Set());
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(
        new Set(
          paginatedLedgers
            .filter((l) => l.status === "active")
            .map((l) => l.id)
        )
      );
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleBatchArchive = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`确定要归档选中的 ${selectedIds.size} 条记录吗？`)) {
      batchArchiveMutation.mutate(Array.from(selectedIds));
    }
  };

  const handleArchive = (id: string) => {
    if (window.confirm("确定要归档此记录吗？")) {
      archiveMutation.mutate(id);
    }
  };

  const getDaysLeft = (dateStr: string) => {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  };

  const getExpiryClass = (daysLeft: number) => {
    if (daysLeft < 0) return "text-red-600 font-medium";
    if (daysLeft <= 30) return "text-amber-600 font-medium";
    return "text-slate-600";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">台账管理</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="搜索试剂名称、批次号..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="active">使用中</option>
            <option value="archived">已归档</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Batch Archive Button */}
          {selectedIds.size > 0 && (
            <button
              onClick={handleBatchArchive}
              disabled={batchArchiveMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {batchArchiveMutation.isPending
                ? "归档中..."
                : `归档选中 (${selectedIds.size})`}
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">加载中...</div>
          ) : paginatedLedgers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">暂无数据</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 w-10">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={
                          paginatedLedgers.filter((l) => l.status === "active").length >
                            0 &&
                          paginatedLedgers
                            .filter((l) => l.status === "active")
                            .every((l) => selectedIds.has(l.id))
                        }
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      内部编号
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      试剂
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      规格
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      数量
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      分类
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      状态
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      创建人
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      创建时间
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      有效期
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLedgers.map((ledger) => {
                    const effectiveDaysLeft = getDaysLeft(ledger.effective_expiry_date);

                    return (
                      <tr key={ledger.id} className="hover:bg-slate-50">
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          {ledger.status === "active" && (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(ledger.id)}
                              onChange={(e) => handleSelect(ledger.id, e.target.checked)}
                              className="rounded border-slate-300"
                            />
                          )}
                        </td>

                        {/* Internal Batch No */}
                        <td className="px-4 py-3">
                          <Link
                            href={`/ledger/${ledger.id}`}
                            className="font-mono text-xs text-blue-600 hover:underline"
                          >
                            {ledger.internal_batch_no}
                          </Link>
                        </td>

                        {/* Product Name */}
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {ledger.product_name}
                        </td>

                        {/* Spec (weight_capacity) */}
                        <td className="px-4 py-3 text-slate-500">
                          {ledger.weight_capacity}
                        </td>

                        {/* Quantity */}
                        <td className="px-4 py-3 text-slate-500">
                          {ledger.quantity}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 text-slate-500">
                          {ledger.category?.level2 || "-"}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              ledger.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {ledger.status === "active" ? "使用中" : "已归档"}
                          </span>
                        </td>

                        {/* Creator */}
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {ledger.creator?.username || ledger.created_by_id?.slice(0, 8) || "-"}
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {ledger.created_at
                            ? format(new Date(ledger.created_at), "yyyy-MM-dd")
                            : "-"}
                        </td>

                        {/* Expiry Date */}
                        <td className={clsx("px-4 py-3", getExpiryClass(effectiveDaysLeft))}>
                          {ledger.effective_expiry_date?.slice(0, 10)}
                          {effectiveDaysLeft <= 30 && effectiveDaysLeft >= 0 && (
                            <span className="ml-1 text-xs">({effectiveDaysLeft}天)</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/ledger/${ledger.id}`}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              查看
                            </Link>
                            {ledger.status === "active" && (
                              <button
                                onClick={() => handleArchive(ledger.id)}
                                className="text-orange-600 hover:text-orange-800 text-xs font-medium"
                              >
                                归档
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4">
            <div className="text-sm text-slate-600">
              共 {filteredLedgers.length} 条记录，第 {currentPage}/{totalPages} 页
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
