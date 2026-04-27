"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ledgerApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";

export default function LedgerDetailPage() {
  const t = useTranslations("ledger");
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openDate, setOpenDate] = useState("");

  const { data: ledger, isLoading } = useQuery({
    queryKey: ["ledger", id],
    queryFn: () => ledgerApi.get(id).then((r) => r.data),
    enabled: !!id,
  });

  const archiveMutation = useMutation({
    mutationFn: () => ledgerApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      queryClient.invalidateQueries({ queryKey: ["ledgers"] });
    },
  });

  const openDateMutation = useMutation({
    mutationFn: (date: string) => ledgerApi.enterOpenDate(id, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      queryClient.invalidateQueries({ queryKey: ["ledgers"] });
      setOpenDatePicker(false);
    },
  });

  if (isLoading) return <div className="text-center py-12 text-gray-500">{t("loading")}</div>;
  if (!ledger) return <div className="text-center py-12 text-red-500">台账不存在</div>;

  const canEdit = user?.id === ledger.created_by_id || user?.role === "admin";
  const daysLeft = Math.ceil((new Date(ledger.effective_expiry_date).getTime() - Date.now()) / 86400000);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600">← {t("back")}</Link>
        <h1 className="text-2xl font-bold text-gray-900">{ledger.product_name}</h1>
        <span className={clsx(
          "px-2 py-0.5 rounded text-xs font-medium",
          ledger.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        )}>
          {t(`status.${ledger.status}`)}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {[
            [t("fields.internalBatchNo"), ledger.internal_batch_no, "font-mono"],
            [t("fields.batchNo"), ledger.batch_no],
            [t("fields.casNo"), ledger.cas_no],
            [t("fields.weightCapacity"), ledger.weight_capacity],
            [t("fields.supplier"), ledger.supplier],
            [t("fields.quantity"), ledger.quantity],
            [t("fields.category"), `${ledger.category.level1} / ${ledger.category.level2}`],
            [t("fields.certExpiryDate"), ledger.cert_expiry_date?.slice(0, 10)],
            [
              t("fields.effectiveExpiryDate"),
              `${ledger.effective_expiry_date?.slice(0, 10)}${daysLeft <= 30 ? ` (${daysLeft}天)` : ""}`,
              daysLeft <= 30 ? "text-amber-600 font-medium" : "text-gray-900"
            ],
            [t("fields.isOpened"), ledger.is_opened ? "是" : "否"],
            ledger.open_date && [t("fields.openDate"), ledger.open_date?.slice(0, 10)],
          ].filter(Boolean).map(([label, value, extra]) => (
            <div key={label as string} className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs">{label as string}</span>
              <span className={clsx("text-gray-900", extra as string)}>{value as string}</span>
            </div>
          ))}
        </div>

        {ledger.remarks && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500 mb-1">{t("fields.remarks")}</p>
            <p className="text-sm text-gray-700">{ledger.remarks}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {ledger.status === "active" && (
        <div className="flex flex-wrap gap-3">
          {!ledger.is_opened && canEdit && (
            <button
              onClick={() => setOpenDatePicker(true)}
              className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-200"
            >
              {t("enterOpenDate")}
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
            >
              {t("archive")}
            </button>
          )}
        </div>
      )}

      {/* Open Date Picker Modal */}
      {openDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">{t("enterOpenDate")}</h3>
            <input
              type="date"
              value={openDate}
              onChange={(e) => setOpenDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setOpenDatePicker(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => openDate && openDateMutation.mutate(openDate)}
                disabled={!openDate || openDateMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
              >
                {openDateMutation.isPending ? "..." : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
