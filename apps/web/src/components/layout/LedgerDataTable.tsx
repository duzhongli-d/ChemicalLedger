"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ledgerApi } from "@/lib/api-client";
import clsx from "clsx";
import { useState } from "react";

interface Ledger {
  id: string;
  internal_batch_no: string;
  product_name: string;
  batch_no: string;
  category: { level1: string; level2: string };
  cert_expiry_date: string;
  effective_expiry_date: string;
  status: "active" | "archived";
  is_opened: boolean;
  open_date: string | null;
}

interface LedgerDataTableProps {
  ledgers: Ledger[];
  isLoading?: boolean;
  error?: Error | null;
  onArchive?: (id: string) => void;
  onProtectedAction?: (ledgerId?: string) => void;
  isLoggedIn?: boolean;
  className?: string;
}

function DatePickerModal({
  ledgerId,
  onClose,
  onConfirm,
}: {
  ledgerId: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("ledger");
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleConfirm = async () => {
    try {
      await ledgerApi.enterOpenDate(ledgerId, selectedDate);
      await queryClient.invalidateQueries({ queryKey: ["ledgers"] });
      onConfirm();
    } catch (error) {
      console.error("Failed to set open date:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 cursor-pointer"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 cursor-default">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          {t("openDateAction")}
        </h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none mb-4"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {t("openDateCancel")}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            {t("openDateConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LedgerDataTable({
  ledgers,
  isLoading,
  error,
  onArchive,
  onProtectedAction,
  isLoggedIn = false,
  className = "",
}: LedgerDataTableProps) {
  const t = useTranslations("ledger");
  const tCommon = useTranslations("common");

  const [datePickerLedgerId, setDatePickerLedgerId] = useState<string | null>(
    null
  );

  const getDaysLeft = (dateStr: string) => {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  };

  const getExpiryClass = (daysLeft: number) => {
    if (daysLeft < 0) return "text-red-600 font-medium";
    if (daysLeft <= 30) return "text-amber-600 font-medium";
    return "text-slate-600";
  };

  const handleOpenDateClick = (ledger: Ledger) => {
    if (!isLoggedIn) {
      onProtectedAction?.(ledger.id);
      return;
    }
    setDatePickerLedgerId(ledger.id);
  };

  if (error) {
    return (
      <div
        className={clsx(
          "bg-white rounded-xl border border-red-200 shadow-sm",
          className
        )}
      >
        <div className="p-8 text-center">
          <p className="text-red-500 font-medium">{tCommon("failedToLoad")}</p>
          <p className="text-sm mt-1 text-slate-400">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={clsx(
          "bg-white rounded-xl border border-slate-200 shadow-sm",
          className
        )}
      >
        <div className="p-8 text-center text-slate-500">
          {tCommon("loading")}
        </div>
      </div>
    );
  }

  if (ledgers.length === 0) {
    return (
      <div
        className={clsx(
          "bg-white rounded-xl border border-slate-200 shadow-sm",
          className
        )}
      >
        <div className="p-8 text-center text-slate-400">{tCommon("noData")}</div>
      </div>
    );
  }

  return (
    <>
      {datePickerLedgerId && (
        <DatePickerModal
          ledgerId={datePickerLedgerId}
          onClose={() => setDatePickerLedgerId(null)}
          onConfirm={() => setDatePickerLedgerId(null)}
        />
      )}
      <div
        className={clsx(
          "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden",
          className
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {[
                  { key: "internalBatchNo", label: t("fields.internalBatchNo") },
                  { key: "productName", label: t("fields.productName") },
                  { key: "batchNo", label: t("fields.batchNo") },
                  { key: "category", label: t("fields.category") },
                  { key: "openDate", label: t("fields.openDate") },
                  { key: "certExpiryDate", label: t("fields.certExpiryDate") },
                  {
                    key: "effectiveExpiryDate",
                    label: t("fields.effectiveExpiryDate"),
                  },
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
                const effectiveDaysLeft = getDaysLeft(
                  ledger.effective_expiry_date
                );

                return (
                  <tr
                    key={ledger.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
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

                    {/* Category - Level1 / Level2 */}
                    <td className="px-4 py-3 text-slate-500">
                      {ledger.category?.level1 && ledger.category?.level2
                        ? `${ledger.category.level1} / ${ledger.category.level2}`
                        : ledger.category?.level2 || "-"}
                    </td>

                    {/* Open Date */}
                    <td className="px-4 py-3 text-slate-500">
                      {ledger.open_date
                        ? ledger.open_date.split("T")[0]
                        : "-"}
                    </td>

                    {/* Cert Expiry Date */}
                    <td
                      className={clsx("px-4 py-3", getExpiryClass(certDaysLeft))}
                    >
                      {ledger.cert_expiry_date.slice(0, 10)}
                      {certDaysLeft <= 30 && certDaysLeft >= 0 && (
                        <span className="ml-1 text-xs">({certDaysLeft}d)</span>
                      )}
                    </td>

                    {/* Effective Expiry Date */}
                    <td
                      className={clsx(
                        "px-4 py-3",
                        getExpiryClass(effectiveDaysLeft)
                      )}
                    >
                      {ledger.effective_expiry_date.slice(0, 10)}
                      {effectiveDaysLeft <= 30 && effectiveDaysLeft >= 0 && (
                        <span className="ml-1 text-xs">
                          ({effectiveDaysLeft}d)
                        </span>
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

                        {/* Set Open Date - only for active, unopened ledgers */}
                        {ledger.status === "active" &&
                          !ledger.is_opened &&
                          onArchive && (
                            <button
                              onClick={() => handleOpenDateClick(ledger)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              title={t("openDateAction")}
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
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 11v4l2 2"
                                />
                              </svg>
                            </button>
                          )}

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
    </>
  );
}