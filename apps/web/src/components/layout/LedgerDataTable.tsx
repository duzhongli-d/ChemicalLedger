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
  weight_capacity: string;
  supplier: string;
  batch_no: string;
  cas_no: string;
  category: { level1: string; level2: string };
  created_at: string;
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
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 cursor-default border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("openDateAction")}
        </h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none mb-4 bg-background text-foreground"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            {t("openDateCancel")}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
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

  const getDaysColorClass = (daysLeft: number, status: string) => {
    if (status === "archived") return "";
    if (daysLeft <= 10) return "text-red-600 font-medium";
    if (daysLeft <= 20) return "text-yellow-600 font-medium";
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
          "bg-card rounded-xl border border-error/50",
          className
        )}
      >
        <div className="p-8 text-center">
          <p className="text-red-500 font-medium">{tCommon("failedToLoad")}</p>
          <p className="text-sm mt-1 text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={clsx(
          "bg-card rounded-xl border border-border",
          className
        )}
      >
        <div className="p-8 text-center text-muted-foreground">
          {tCommon("loading")}
        </div>
      </div>
    );
  }

  if (ledgers.length === 0) {
    return (
      <div
        className={clsx(
          "bg-card rounded-xl border border-border",
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
          "bg-card rounded-xl border border-border overflow-hidden",
          className
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                {[
                  { key: "internalBatchNo", label: t("fields.internalBatchNo") },
                  { key: "productName", label: t("fields.productName") },
                  { key: "weightCapacity", label: t("fields.weightCapacity") },
                  { key: "supplier", label: t("fields.supplier") },
                  { key: "batchNo", label: t("fields.batchNo") },
                  { key: "casNo", label: t("fields.casNo") },
                  { key: "category", label: t("fields.category") },
                  { key: "createdAt", label: t("fields.createdAt") },
                  { key: "certExpiryDate", label: t("fields.certExpiryDate") },
                  { key: "openDate", label: t("fields.openDate") },
                  {
                    key: "effectiveExpiryDate",
                    label: t("fields.effectiveExpiryDate"),
                  },
                  { key: "daysLeft", label: t("fields.daysLeft") },
                  { key: "status", label: t("fields.status") },
                  { key: "actions", label: t("fields.actions") },
                ].map((h) => (
                  <th
                    key={h.key}
                    className="text-left px-4 py-3.5 font-semibold text-muted-foreground whitespace-nowrap"
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {ledgers.map((ledger) => {
                const certDaysLeft = getDaysLeft(ledger.cert_expiry_date);
                const effectiveDaysLeft = getDaysLeft(
                  ledger.effective_expiry_date
                );

                return (
                  <tr
                    key={ledger.id}
                    className="hover:bg-secondary transition-colors"
                  >
                    {/* Internal Batch No - monospace orange */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/ledger/${ledger.id}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {ledger.internal_batch_no}
                      </Link>
                    </td>

                    {/* Product Name */}
                    <td className="px-4 py-3 font-medium text-foreground">
                      {ledger.product_name}
                    </td>

                    {/* Specification */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {ledger.weight_capacity || "-"}
                    </td>

                    {/* Supplier */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {ledger.supplier || "-"}
                    </td>

                    {/* Batch No */}
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {ledger.batch_no}
                    </td>

                    {/* CAS No */}
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {ledger.cas_no || "-"}
                    </td>

                    {/* Category - Level1 / Level2 */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {ledger.category?.level1 && ledger.category?.level2
                        ? `${ledger.category.level1} / ${ledger.category.level2}`
                        : ledger.category?.level2 || "-"}
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {ledger.created_at ? ledger.created_at.split("T")[0] : "-"}
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

                    {/* Open Date */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {ledger.is_opened && ledger.open_date
                        ? ledger.open_date.split("T")[0]
                        : t("notOpened")}
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

                    {/* Days Left */}
                    <td className="px-4 py-3">
                      {ledger.status === "archived" ? (
                        "-"
                      ) : (
                        <span
                          className={clsx(
                            getDaysColorClass(effectiveDaysLeft, ledger.status)
                          )}
                        >
                          {effectiveDaysLeft}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "inline-block px-2 py-0.5 rounded text-xs font-medium",
                          ledger.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-secondary text-muted-foreground"
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
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
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
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
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
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
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