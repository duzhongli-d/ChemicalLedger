"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import clsx from "clsx";

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

interface LedgerDataTableProps {
  ledgers: Ledger[];
  isLoading?: boolean;
  onArchive?: (id: string) => void;
  onProtectedAction?: () => void;
  isLoggedIn?: boolean;
  className?: string;
}

export function LedgerDataTable({
  ledgers,
  isLoading,
  onArchive,
  onProtectedAction,
  isLoggedIn = false,
  className = "",
}: LedgerDataTableProps) {
  const t = useTranslations("ledger");
  const tCommon = useTranslations("common");

  const getDaysLeft = (dateStr: string) => {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  };

  const getExpiryClass = (daysLeft: number) => {
    if (daysLeft < 0) return "text-red-600 font-medium";
    if (daysLeft <= 30) return "text-amber-600 font-medium";
    return "text-slate-600";
  };

  if (isLoading) {
    return (
      <div className={clsx("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
        <div className="p-8 text-center text-slate-500">{tCommon("loading")}</div>
      </div>
    );
  }

  if (ledgers.length === 0) {
    return (
      <div className={clsx("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
        <div className="p-8 text-center text-slate-400">{tCommon("noData")}</div>
      </div>
    );
  }

  return (
    <div className={clsx("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {[
                { key: "internalBatchNo", label: t("fields.internalBatchNo") },
                { key: "productName", label: t("fields.productName") },
                { key: "batchNo", label: t("fields.batchNo") },
                { key: "category", label: t("fields.category") },
                { key: "certExpiryDate", label: t("fields.certExpiryDate") },
                { key: "effectiveExpiryDate", label: t("fields.effectiveExpiryDate") },
                { key: "status", label: t("fields.status") },
                { key: "actions", label: "" },
              ].map((h) => (
                <th
                  key={h.key}
                  className="text-left px-4 py-3.5 font-semibold text-slate-600 whitespace-nowrap"
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ledgers.map((ledger) => {
              const certDaysLeft = getDaysLeft(ledger.cert_expiry_date);
              const effectiveDaysLeft = getDaysLeft(ledger.effective_expiry_date);

              return (
                <tr key={ledger.id} className="hover:bg-slate-50 transition-colors">
                  {/* Internal Batch No - monospace orange */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/ledger/${ledger.id}`}
                      className="font-mono text-xs text-[#f97316] hover:underline"
                    >
                      {ledger.internal_batch_no}
                    </Link>
                  </td>

                  {/* Product Name */}
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {ledger.product_name}
                  </td>

                  {/* Batch No */}
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {ledger.batch_no}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-slate-500">
                    {ledger.category?.level2 || "-"}
                  </td>

                  {/* Cert Expiry Date */}
                  <td className={clsx("px-4 py-3", getExpiryClass(certDaysLeft))}>
                    {ledger.cert_expiry_date.slice(0, 10)}
                    {certDaysLeft <= 30 && certDaysLeft >= 0 && (
                      <span className="ml-1 text-xs">({certDaysLeft}d)</span>
                    )}
                  </td>

                  {/* Effective Expiry Date */}
                  <td className={clsx("px-4 py-3", getExpiryClass(effectiveDaysLeft))}>
                    {ledger.effective_expiry_date.slice(0, 10)}
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
                      {t(`status.${ledger.status}`)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* View */}
                      <Link
                        href={`/ledger/${ledger.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="View"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Link>

                      {/* Archive */}
                      {ledger.status === "active" && onArchive && (
                        <button
                          onClick={() => {
                            if (!isLoggedIn) {
                              onProtectedAction?.();
                              return;
                            }
                            onArchive(ledger.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          title={t("archive")}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
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
    </div>
  );
}
