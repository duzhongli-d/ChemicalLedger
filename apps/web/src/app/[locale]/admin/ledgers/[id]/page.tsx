"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminLedgerApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getDaysLeft, getExpiryClass } from "@/lib/date-utils";

export default function AdminLedgerDetailPage() {
  const t = useTranslations("ledger");
  const params = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const { data: ledger, isLoading } = useQuery({
    queryKey: ["admin-ledger", id],
    queryFn: () => adminLedgerApi.list({ page: 1, page_size: 1 }).then(async (r) => {
      // Fetch single ledger by ID - for now we get all and filter
      // In production, you'd have adminLedgerApi.get(id)
      const all = await adminLedgerApi.list({ page: 1, page_size: 100 }).then((res) => res.data);
      return all.items.find((l: { id: string }) => l.id === id);
    }),
    enabled: !!id,
  });

  const archiveMutation = useMutation({
    mutationFn: () => adminLedgerApi.update(id, { status: "archived" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ledger", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-ledgers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ledgers-all"] });
      setShowArchiveConfirm(false);
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-500 text-sm">{t("loading")}</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!ledger) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">台账不存在</p>
          <Link href="/admin/ledgers" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            ← 返回台账列表
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const certDaysLeft = getDaysLeft(ledger.cert_expiry_date);
  const effectiveDaysLeft = getDaysLeft(ledger.effective_expiry_date);
  const isExpired = effectiveDaysLeft < 0;
  const isExpiringSoon = effectiveDaysLeft >= 0 && effectiveDaysLeft <= 10;
  const isExpiring = effectiveDaysLeft > 10 && effectiveDaysLeft <= 20;

  const getStatusBadgeClass = () => {
    if (ledger.status === "archived") return "bg-slate-100 text-slate-500 border-slate-200";
    if (isExpired) return "bg-red-100 text-red-700 border-red-200";
    if (isExpiringSoon) return "bg-amber-100 text-amber-700 border-amber-200";
    if (isExpiring) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  const getExpiryIndicatorClass = () => {
    if (ledger.status === "archived") return "bg-slate-400";
    if (isExpired) return "bg-red-500";
    if (isExpiringSoon) return "bg-amber-500 animate-pulse";
    if (isExpiring) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <AdminLayout>
      <main className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/ledgers"
              className="group flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-sm font-medium hidden sm:inline">{t("back")}</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-1 h-10 rounded-full bg-gradient-to-b from-orange-500 to-teal-500" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{ledger.product_name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                    {ledger.internal_batch_no}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-sm text-slate-500">{ledger.batch_no}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border",
              getStatusBadgeClass()
            )}>
              <span className={clsx("w-1.5 h-1.5 rounded-full", getExpiryIndicatorClass())} />
              {t(`status.${ledger.status}`)}
            </span>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/ledgers/${id}/edit`}
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-teal-500/25"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t("edit")}
              </Link>
              {ledger.status === "active" && (
                <button
                  onClick={() => setShowArchiveConfirm(true)}
                  className="inline-flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  {t("archive")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        {ledger.status === "active" && (
          <div className={clsx(
            "rounded-xl border px-5 py-4 flex items-center gap-6",
            isExpired ? "bg-red-50 border-red-200" :
            isExpiringSoon ? "bg-amber-50 border-amber-200" :
            isExpiring ? "bg-yellow-50 border-yellow-200" :
            "bg-emerald-50 border-emerald-200"
          )}>
            <div className="flex items-center gap-3">
              <div className={clsx(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                isExpired ? "bg-red-100" :
                isExpiringSoon ? "bg-amber-100" :
                isExpiring ? "bg-yellow-100" :
                "bg-emerald-100"
              )}>
                <svg className={clsx(
                  "w-6 h-6",
                  isExpired ? "text-red-600" :
                  isExpiringSoon ? "text-amber-600" :
                  isExpiring ? "text-yellow-600" :
                  "text-emerald-600"
                )} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className={clsx(
                  "text-2xl font-bold",
                  isExpired ? "text-red-600" :
                  isExpiringSoon ? "text-amber-600" :
                  isExpiring ? "text-yellow-600" :
                  "text-emerald-600"
                )}>
                  {effectiveDaysLeft < 0 ? Math.abs(effectiveDaysLeft) : effectiveDaysLeft}
                </p>
                <p className="text-xs text-slate-500">
                  {isExpired ? t("dashboard.expiredNotArchived") : t("fields.daysLeft")}
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div>
                <span className="text-slate-500 text-xs">{t("fields.certExpiryDate")}</span>
                <p className={clsx("font-semibold", getExpiryClass(certDaysLeft))}>
                  {ledger.cert_expiry_date?.slice(0, 10)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">{t("fields.effectiveExpiryDate")}</span>
                <p className={clsx("font-semibold", getExpiryClass(effectiveDaysLeft))}>
                  {ledger.effective_expiry_date?.slice(0, 10)}
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("fields.isOpened")}</p>
                <p className="font-semibold text-slate-700">
                  {ledger.is_opened ? "已开封" : "未开封"}
                  {ledger.open_date ? ` (${ledger.open_date?.slice(0, 10)})` : ""}
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("fields.quantity")}</p>
                <p className="font-semibold text-slate-700">{ledger.quantity}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-orange-500" />
              <h3 className="text-sm font-semibold text-slate-700">{t("basicInfo")}</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: t("fields.batchNo"), value: ledger.batch_no, mono: true },
                { label: t("fields.casNo"), value: ledger.cas_no || "-", mono: true },
                { label: t("fields.weightCapacity"), value: ledger.weight_capacity },
                { label: t("fields.supplier"), value: ledger.supplier },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className={clsx(
                    "text-sm text-slate-900 font-medium text-right",
                    mono && "font-mono"
                  )}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category & Classification Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-teal-500" />
              <h3 className="text-sm font-semibold text-slate-700">{t("classification")}</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500">{t("fields.category")}</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-900">{ledger.category?.level1}</span>
                  {ledger.category?.level2 && (
                    <span className="text-slate-400 mx-1">/</span>
                  )}
                  <span className="text-sm text-slate-700">{ledger.category?.level2}</span>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500">{t("fields.quantity")}</span>
                <span className="text-sm font-bold text-slate-900">{ledger.quantity}</span>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700">{t("metadata")}</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500">{t("fields.createdBy")}</span>
                <span className="text-sm text-slate-900">{ledger.creator?.username || "-"}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500">{t("fields.createdAt")}</span>
                <span className="text-sm text-slate-700">{ledger.created_at?.slice(0, 10)}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500">{t("fields.isOpened")}</span>
                <span className={clsx(
                  "text-sm font-medium",
                  ledger.is_opened ? "text-emerald-600" : "text-slate-400"
                )}>
                  {ledger.is_opened ? "已开封" : "未开封"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin-specific Expiry Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-amber-500" />
            <h3 className="text-sm font-semibold text-slate-700">{t("effectiveExpiryInfo")}</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs text-slate-500 block mb-1">{t("fields.certExpiryDate")}</span>
                <span className={clsx("text-lg font-bold", getExpiryClass(certDaysLeft))}>
                  {ledger.cert_expiry_date?.slice(0, 10)}
                </span>
                <span className="text-xs text-slate-400 ml-2">({certDaysLeft}天)</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">{t("fields.effectiveExpiryDate")}</span>
                <span className={clsx("text-lg font-bold", getExpiryClass(effectiveDaysLeft))}>
                  {ledger.effective_expiry_date?.slice(0, 10)}
                </span>
                <span className="text-xs text-slate-400 ml-2">({effectiveDaysLeft}天)</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">开封日期</span>
                <span className="text-lg font-bold text-slate-700">
                  {ledger.is_opened && ledger.open_date ? ledger.open_date.slice(0, 10) : "未开封"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks Card */}
        {ledger.remarks && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-amber-500" />
              <h3 className="text-sm font-semibold text-slate-700">{t("fields.remarks")}</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-600 leading-relaxed">{ledger.remarks}</p>
            </div>
          </div>
        )}
      </main>

      {/* Archive Confirm Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowArchiveConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t("archive")}</h3>
              <p className="text-sm text-slate-500 mb-6">{t("confirmArchive")}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={() => archiveMutation.mutate()}
                  disabled={archiveMutation.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  {archiveMutation.isPending ? t("loading") : t("confirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}