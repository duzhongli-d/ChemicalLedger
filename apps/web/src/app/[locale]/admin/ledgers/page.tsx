"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { adminLedgerApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Pagination } from "@/components/layout/Pagination";

const PAGE_SIZE = 20;

interface Ledger {
  id: string;
  internal_batch_no: string;
  product_name: string;
  batch_no: string;
  category: { level1: string; level2: string };
  cert_expiry_date: string;
  effective_expiry_date: string;
  status: "active" | "archived";
}

export default function AdminLedgersPage() {
  const t = useTranslations("admin");
  const tLedger = useTranslations("ledger");
  const tCommon = useTranslations("common");
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: ledgers = [], isLoading } = useQuery({
    queryKey: ["admin-ledgers"],
    queryFn: () => adminLedgerApi.list().then((r) => r.data),
    enabled: isAdmin(),
  });

  // Filter ledgers
  const filteredLedgers = useMemo(() => {
    let filtered: Ledger[] = Array.isArray(ledgers) ? ledgers : [];

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }

    // Search filter
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
  }, [ledgers, statusFilter, searchQuery]);

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
      setSelectedIds(new Set(paginatedLedgers.filter((l) => l.status === "active").map((l) => l.id)));
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
    if (window.confirm(tLedger("confirmArchive"))) {
      batchArchiveMutation.mutate(Array.from(selectedIds));
    }
  };

  const handleArchive = (id: string) => {
    if (window.confirm(tLedger("confirmArchive"))) {
      archiveMutation.mutate(id);
    }
  };

  if (!isAdmin()) {
    return <div className="text-center py-12 text-red-500">需要管理员权限</div>;
  }

  const getDaysLeft = (dateStr: string) => {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  };

  const getExpiryClass = (daysLeft: number) => {
    if (daysLeft < 0) return "text-red-600 font-medium";
    if (daysLeft <= 30) return "text-amber-600 font-medium";
    return "text-slate-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600">← {t("ledgers") || "台账管理"}</Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("ledgers") || "台账管理"}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={tLedger("filter.search")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">{tLedger("filter.all")}</option>
          <option value="active">{tLedger("status.active")}</option>
          <option value="archived">{tLedger("status.archived")}</option>
        </select>

        {/* Batch Archive Button */}
        {selectedIds.size > 0 && (
          <button
            onClick={handleBatchArchive}
            disabled={batchArchiveMutation.isPending}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {batchArchiveMutation.isPending ? tCommon("loading") : `归档选中 (${selectedIds.size})`}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{tCommon("loading")}</div>
        ) : paginatedLedgers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{tCommon("noData")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={
                        paginatedLedgers.filter((l) => l.status === "active").length > 0 &&
                        paginatedLedgers.filter((l) => l.status === "active").every((l) => selectedIds.has(l.id))
                      }
                      className="rounded border-gray-300"
                    />
                  </th>
                  {[
                    { key: "internalBatchNo", label: tLedger("fields.internalBatchNo") },
                    { key: "productName", label: tLedger("fields.productName") },
                    { key: "batchNo", label: tLedger("fields.batchNo") },
                    { key: "category", label: tLedger("fields.category") },
                    { key: "certExpiryDate", label: tLedger("fields.certExpiryDate") },
                    { key: "effectiveExpiryDate", label: tLedger("fields.effectiveExpiryDate") },
                    { key: "status", label: tLedger("fields.status") },
                    { key: "actions", label: "" },
                  ].map((h) => (
                    <th key={h.key} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLedgers.map((ledger) => {
                  const certDaysLeft = getDaysLeft(ledger.cert_expiry_date);
                  const effectiveDaysLeft = getDaysLeft(ledger.effective_expiry_date);

                  return (
                    <tr key={ledger.id} className="hover:bg-gray-50">
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        {ledger.status === "active" && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(ledger.id)}
                            onChange={(e) => handleSelect(ledger.id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        )}
                      </td>

                      {/* Internal Batch No */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/ledger/${ledger.id}`}
                          className="font-mono text-xs text-[#f97316] hover:underline"
                        >
                          {ledger.internal_batch_no}
                        </Link>
                      </td>

                      {/* Product Name */}
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {ledger.product_name}
                      </td>

                      {/* Batch No */}
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {ledger.batch_no}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-gray-500">
                        {ledger.category?.level2 || "-"}
                      </td>

                      {/* Cert Expiry Date */}
                      <td className={clsx("px-4 py-3", getExpiryClass(certDaysLeft))}>
                        {ledger.cert_expiry_date?.slice(0, 10)}
                        {certDaysLeft <= 30 && certDaysLeft >= 0 && (
                          <span className="ml-1 text-xs">({certDaysLeft}d)</span>
                        )}
                      </td>

                      {/* Effective Expiry Date */}
                      <td className={clsx("px-4 py-3", getExpiryClass(effectiveDaysLeft))}>
                        {ledger.effective_expiry_date?.slice(0, 10)}
                        {effectiveDaysLeft <= 30 && effectiveDaysLeft >= 0 && (
                          <span className="ml-1 text-xs">({effectiveDaysLeft}d)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "inline-block px-2 py-0.5 rounded text-xs font-medium",
                            ledger.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {tLedger(`status.${ledger.status}`)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <Link
                            href={`/ledger/${ledger.id}`}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/ledger/${ledger.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title={tCommon("edit")}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>

                          {/* Archive */}
                          {ledger.status === "active" && (
                            <button
                              onClick={() => handleArchive(ledger.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title={tLedger("archive")}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredLedgers.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}