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
import { ImportLedgerModal } from "@/components/admin/ImportLedgerModal";

const PAGE_SIZE = 20;

function StatusBadge({ status, daysLeft }: { status: string; daysLeft: number }) {
  if (status === "archived") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        已归档
      </span>
    );
  }
  if (daysLeft < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        已过期
      </span>
    );
  }
  if (daysLeft <= 10) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        剩余{daysLeft}天
      </span>
    );
  }
  if (daysLeft <= 20) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        剩余{daysLeft}天
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      使用中
    </span>
  );
}

function LedgerViewModal({ ledger, onClose }: { ledger: Ledger; onClose: () => void }) {
  const effectiveDaysLeft = getDaysLeft(ledger.effective_expiry_date);
  const certDaysLeft = getDaysLeft(ledger.cert_expiry_date);

  const fields: { label: string; value: string }[] = [
    { label: "内部编号", value: ledger.internal_batch_no },
    { label: "品名", value: ledger.product_name },
    { label: "规格", value: ledger.weight_capacity || "-" },
    { label: "供应商", value: ledger.supplier || "-" },
    { label: "批号", value: ledger.batch_no || "-" },
    { label: "CAS号", value: ledger.cas_no || "-" },
    { label: "品类", value: ledger.category?.level1 && ledger.category?.level2 ? `${ledger.category.level1} / ${ledger.category.level2}` : ledger.category?.level2 || "-" },
    { label: "创建时间", value: ledger.created_at ? format(new Date(ledger.created_at), "yyyy-MM-dd") : "-" },
    { label: "证书有效期", value: ledger.cert_expiry_date ? `${ledger.cert_expiry_date.slice(0, 10)}${certDaysLeft <= 30 && certDaysLeft >= 0 ? ` (${certDaysLeft}天)` : ""}` : "-" },
    { label: "开封日期", value: ledger.is_opened && ledger.open_date ? format(new Date(ledger.open_date), "yyyy-MM-dd") : "未开封" },
    { label: "有效期", value: ledger.effective_expiry_date ? `${ledger.effective_expiry_date.slice(0, 10)}${effectiveDaysLeft <= 30 && effectiveDaysLeft >= 0 ? ` (${effectiveDaysLeft}天)` : ""}` : "-" },
  ];

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden modal-animate shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-slate-100">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent"></div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 font-mono-custom">台账详情</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{ledger.internal_batch_no}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <span className="text-xs text-slate-500 w-20 flex-shrink-0 pt-0.5 font-mono-custom">{f.label}</span>
                <span className="text-sm text-slate-900 font-medium font-mono-custom">{f.value}</span>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-20 flex-shrink-0 font-mono-custom">状态</span>
              <StatusBadge status={ledger.status} daysLeft={effectiveDaysLeft} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Link
            href={`/admin/ledgers/${ledger.id}/edit`}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-all"
          >
            编辑
          </Link>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-all"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLedgersPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTabValue>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingLedger, setViewingLedger] = useState<Ledger | null>(null);
  const [showImport, setShowImport] = useState(false);

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

  // Group categories by level1 for optgroup display
  const groupedCategories = useMemo(() => {
    const result: Record<string, CategoryResponse[]> = {};
    (categoriesData ?? []).forEach((c: CategoryResponse) => {
      if (!result[c.level1]) result[c.level1] = [];
      result[c.level1].push(c);
    });
    return Object.keys(result).sort().reduce((acc, key) => {
      acc[key] = result[key].sort((a, b) => a.level2.localeCompare(b.level2));
      return acc;
    }, {} as Record<string, CategoryResponse[]>);
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

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (file: File) => adminLedgerApi.importLedgers(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-ledgers-all"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ledgers"] });
      setShowImport(false);
      alert(`导入完成：成功 ${data.data.success_count} 条，跳过 ${data.data.skip_count} 条`);
      if (data.data.errors?.length > 0) {
        alert("错误：\n" + data.data.errors.slice(0, 10).join("\n"));
      }
    },
    onError: (err: Error) => alert(err.message || "导入失败"),
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
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .header-slide { animation: headerSlideIn 0.4s ease-out forwards; }
        .card-enter { animation: cardEnter 0.5s ease-out forwards; opacity: 0; }
        .modal-animate { animation: modalSlideUp 0.35s ease-out forwards; }
        .modal-overlay {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
      `}</style>

      <div className="min-h-screen bg-background font-body-custom">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 header-slide">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 font-mono-custom tracking-tight">
                台账管理
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent rounded"></span>
                <span className="text-xs text-slate-500 font-mono-custom">LEDGER MANAGEMENT</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImport(true)}
                className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-2.5 px-4 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                导入
              </button>
              <Link
                href="/admin/ledgers/create"
                className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                创建台账
              </Link>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-3 gap-4 card-enter" style={{ animationDelay: "0.05s" }}>
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">总记录数</p>
                <p className="text-2xl font-semibold font-mono-custom text-slate-900">{tabCounts.all}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">使用中 / Active</p>
                <p className="text-2xl font-semibold font-mono-custom text-slate-900">{tabCounts.active}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">即将到期 (≤20天)</p>
                <p className="text-2xl font-semibold font-mono-custom text-amber-600">{tabCounts.expiring10 + tabCounts.expiring20}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 card-enter" style={{ animationDelay: "0.1s" }}>
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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-mono-custom text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
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
              className="px-4 py-2.5 border border-slate-200 rounded-lg font-mono-custom text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white"
            >
              <option value="">全部品类</option>
              {Object.entries(groupedCategories).map(([level1, cats]) => (
                <optgroup key={level1} label={level1}>
                  {cats.map((c) => (
                    <option key={c.id} value={c.level2}>{c.level2}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* Batch Archive Button */}
            {selectedIds.size > 0 && (
              <button
                onClick={handleBatchArchive}
                disabled={batchArchiveMutation.isPending}
                className="px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors font-mono-custom text-sm"
              >
                {batchArchiveMutation.isPending
                  ? "归档中..."
                  : `归档选中 (${selectedIds.size})`}
              </button>
            )}
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
            ) : ledgers.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 font-mono-custom">暂无数据</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3.5 w-10">
                        <input
                          type="checkbox"
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          checked={
                            ledgers.filter((l) => l.status === "active").length > 0 &&
                            ledgers
                              .filter((l) => l.status === "active")
                              .every((l) => selectedIds.has(l.id))
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">内部编号</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">品名</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">规格</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">供应商</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">批号</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">CAS号</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">品类</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">创建时间</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">证书有效期</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">开封日期</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">有效期</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">剩余天数</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">状态</th>
                      <th className="text-left px-4 py-3.5 font-mono-custom font-medium text-slate-600 whitespace-nowrap text-xs">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgers.map((ledger) => {
                      const certDaysLeft = getDaysLeft(ledger.cert_expiry_date);
                      const effectiveDaysLeft = getDaysLeft(ledger.effective_expiry_date);

                      return (
                        <tr
                          key={ledger.id}
                          className="hover:bg-blue-500/[0.02] border-b border-slate-100 last:border-0 transition-colors"
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3">
                            {ledger.status === "active" && (
                              <input
                                type="checkbox"
                                checked={selectedIds.has(ledger.id)}
                                onChange={(e) => handleSelect(ledger.id, e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            )}
                          </td>

                          {/* Internal Batch No */}
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-blue-600">{ledger.internal_batch_no}</span>
                          </td>

                          {/* Product Name */}
                          <td className="px-4 py-3 font-medium text-slate-900 text-sm">
                            {ledger.product_name}
                          </td>

                          {/* Spec */}
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {ledger.weight_capacity || "-"}
                          </td>

                          {/* Supplier */}
                          <td className="px-4 py-3 text-slate-500 text-xs max-w-[100px] truncate">
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

                          {/* Category */}
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {ledger.category?.level1 && ledger.category?.level2
                              ? `${ledger.category.level1} / ${ledger.category.level2}`
                              : ledger.category?.level2 || "-"}
                          </td>

                          {/* Created Date */}
                          <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                            {ledger.created_at
                              ? format(new Date(ledger.created_at), "yyyy-MM-dd")
                              : "-"}
                          </td>

                          {/* Cert Expiry */}
                          <td className={clsx("px-4 py-3 font-mono text-xs", getExpiryClass(certDaysLeft))}>
                            {ledger.cert_expiry_date?.slice(0, 10)}
                          </td>

                          {/* Open Date */}
                          <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                            {ledger.is_opened && ledger.open_date
                              ? format(new Date(ledger.open_date), "yyyy-MM-dd")
                              : "未开封"}
                          </td>

                          {/* Effective Expiry */}
                          <td className={clsx("px-4 py-3 font-mono text-xs", getExpiryClass(effectiveDaysLeft))}>
                            {ledger.effective_expiry_date?.slice(0, 10)}
                          </td>

                          {/* Days Left */}
                          <td className="px-4 py-3 font-mono text-xs">
                            {ledger.status === "archived" ? (
                              <span className="text-slate-400">-</span>
                            ) : (
                              <span className={getDaysColorClass(effectiveDaysLeft, ledger.status)}>
                                {effectiveDaysLeft}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <StatusBadge status={ledger.status} daysLeft={effectiveDaysLeft} />
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setViewingLedger(ledger)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium font-mono transition-colors"
                              >
                                查看
                              </button>
                              <Link
                                href={`/admin/ledgers/${ledger.id}/edit`}
                                className="text-teal-600 hover:text-teal-800 text-xs font-medium font-mono transition-colors"
                              >
                                编辑
                              </Link>
                              {ledger.status === "active" && (
                                <button
                                  onClick={() => handleArchive(ledger.id)}
                                  className="text-orange-500 hover:text-orange-700 text-xs font-medium font-mono transition-colors"
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
            <div className="card-enter" style={{ animationDelay: "0.3s" }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>

      {/* View Ledger Modal */}
      {viewingLedger && (
        <LedgerViewModal ledger={viewingLedger} onClose={() => setViewingLedger(null)} />
      )}

      {/* Import Modal */}
      <ImportLedgerModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={(file) => importMutation.mutate(file)}
        isPending={importMutation.isPending}
      />
    </AdminLayout>
  );
}