"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import clsx from "clsx";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminLedgerApi, categoryApi, Ledger, CategoryResponse } from "@/lib/api-client";
import { FilterTabs, FilterTabValue } from "@/components/layout/FilterTabs";
import { Pagination } from "@/components/layout/Pagination";
import { getDaysLeft } from "@/lib/date-utils";

const PAGE_SIZE = 20;

export default function AdminLedgersPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTabValue>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch all data for tabCounts (page_size=100 to get most/all records)
  const { data: allLedgersData } = useQuery({
    queryKey: ["admin-ledgers-all"],
    queryFn: () => adminLedgerApi.list({ page_size: 100 }).then((r) => r.data),
  });

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => categoryApi.list().then((r) => r.data as CategoryResponse[]),
  });

  // Server-side paginated query for table data
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["admin-ledgers", currentPage, activeTab, categoryFilter, searchQuery],
    queryFn: () => {
      // Map activeTab to status filter for API
      let status: string | undefined;
      if (activeTab === "archived") {
        status = "archived";
      } else if (activeTab !== "all") {
        // For expiring10, expiring20, expired — we'll fetch all active and filter client-side
        // since effective_expiry_date logic is complex to express in SQL
        status = "active";
      }
      return adminLedgerApi.list({
        page: currentPage,
        page_size: PAGE_SIZE,
        status,
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
      }).then((r) => r.data);
    },
  });

  const ledgers = paginatedData?.items ?? [];
  const totalItems = paginatedData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // Get unique level2 categories for filter
  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    (categoriesData ?? []).forEach((c: CategoryResponse) => {
      if (c.level2) cats.add(c.level2);
    });
    return Array.from(cats).sort();
  }, [categoriesData]);

  // Calculate counts for each tab from full dataset
  const tabCounts = useMemo(() => {
    const counts = { all: 0, active: 0, expiring10: 0, expiring20: 0, expired: 0, archived: 0 };
    (allLedgersData?.items ?? []).forEach((l: Ledger) => {
      counts.all++;
      if (l.status === "archived") {
        counts.archived++;
      } else {
        counts.active++;
        const daysLeft = getDaysLeft(l.effective_expiry_date);
        if (daysLeft < 0) {
          counts.expired++;
        } else if (daysLeft <= 10) {
          counts.expiring10++;
        } else if (daysLeft <= 20) {
          counts.expiring20++;
        }
      }
    });
    return counts;
  }, [allLedgersData]);

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (id: string) => adminLedgerApi.update(id, { status: "archived" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ledgers-all"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ledgers"] });
      setSelectedIds(new Set());
    },
  });

  // Batch archive mutation
  const batchArchiveMutation = useMutation({
    mutationFn: (ids: string[]) => adminLedgerApi.batchArchive(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ledgers-all"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ledgers"] });
      setSelectedIds(new Set());
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(
        new Set(
          ledgers
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

  const getExpiryClass = (daysLeft: number) => {
    if (daysLeft < 0) return "text-red-600 font-medium";
    if (daysLeft <= 30) return "text-amber-600 font-medium";
    return "text-slate-600";
  };

  const getDaysColorClass = (daysLeft: number, status: string) => {
    if (status === "archived") return "";
    if (daysLeft <= 10) return "text-red-600 font-medium";
    if (daysLeft <= 20) return "text-yellow-600 font-medium";
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

          {/* Filter Tabs */}
          <FilterTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            counts={tabCounts}
          />

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部品类</option>
            {categoryOptions.map((cat) => (
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
          ) : ledgers.length === 0 ? (
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
                          ledgers.filter((l) => l.status === "active").length >
                            0 &&
                          ledgers
                            .filter((l) => l.status === "active")
                            .every((l) => selectedIds.has(l.id))
                        }
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">内部编号</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">品名</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">规格</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">供应商</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">批号</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">CAS号</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">品类</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">创建时间</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">证书有效期</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">开封日期</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">有效期</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">剩余有效天数</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">状态</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgers.map((ledger) => {
                    const certDaysLeft = getDaysLeft(ledger.cert_expiry_date);
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

                        {/* Supplier */}
                        <td className="px-4 py-3 text-slate-500">
                          {ledger.supplier || "-"}
                        </td>

                        {/* Batch No */}
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                          {ledger.batch_no || "-"}
                        </td>

                        {/* CAS No */}
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                          {ledger.cas_no || "-"}
                        </td>

                        {/* Category - Level1 / Level2 */}
                        <td className="px-4 py-3 text-slate-500">
                          {ledger.category?.level1 && ledger.category?.level2
                            ? `${ledger.category.level1} / ${ledger.category.level2}`
                            : ledger.category?.level2 || "-"}
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {ledger.created_at
                            ? format(new Date(ledger.created_at), "yyyy-MM-dd")
                            : "-"}
                        </td>

                        {/* Cert Expiry Date */}
                        <td className={clsx("px-4 py-3", getExpiryClass(certDaysLeft))}>
                          {ledger.cert_expiry_date?.slice(0, 10)}
                          {certDaysLeft <= 30 && certDaysLeft >= 0 && (
                            <span className="ml-1 text-xs">({certDaysLeft}天)</span>
                          )}
                        </td>

                        {/* Open Date */}
                        <td className="px-4 py-3 text-slate-500">
                          {ledger.is_opened && ledger.open_date
                            ? format(new Date(ledger.open_date), "yyyy-MM-dd")
                            : "未开封"}
                        </td>

                        {/* Effective Expiry Date */}
                        <td className={clsx("px-4 py-3", getExpiryClass(effectiveDaysLeft))}>
                          {ledger.effective_expiry_date?.slice(0, 10)}
                          {effectiveDaysLeft <= 30 && effectiveDaysLeft >= 0 && (
                            <span className="ml-1 text-xs">({effectiveDaysLeft}天)</span>
                          )}
                        </td>

                        {/* Days Left */}
                        <td className="px-4 py-3">
                          {ledger.status === "archived" ? (
                            "-"
                          ) : (
                            <span className={getDaysColorClass(effectiveDaysLeft, ledger.status)}>
                              {effectiveDaysLeft}
                            </span>
                          )}
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </AdminLayout>
  );
}