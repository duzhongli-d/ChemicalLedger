"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ledgerApi, categoryApi } from "@/lib/api-client";
import { Link } from "@/i18n/navigation";
import clsx from "clsx";

export default function DashboardPage() {
  const t = useTranslations("ledger");
  const tDash = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: ledgers = [], isLoading } = useQuery({
    queryKey: ["ledgers", status, categoryId, search],
    queryFn: () => ledgerApi.list({ status: status || undefined, category_id: categoryId || undefined, search: search || undefined }).then(r => r.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list().then(r => r.data),
  });

  const activeLedgers = ledgers.filter((l: { status: string }) => l.status === "active");
  const expiringSoon = activeLedgers.filter((l: { effective_expiry_date: string }) => {
    const days = Math.ceil((new Date(l.effective_expiry_date).getTime() - Date.now()) / 86400000);
    return days <= 30 && days >= 0;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: tDash("totalLedgers"), value: ledgers.length, color: "bg-blue-50 text-blue-700" },
          { label: tDash("activeLedgers"), value: activeLedgers.length, color: "bg-green-50 text-green-700" },
          { label: tDash("expiringSoon"), value: expiringSoon.length, color: "bg-amber-50 text-amber-700" },
          { label: tDash("archivedLedgers"), value: ledgers.length - activeLedgers.length, color: "bg-gray-50 text-gray-700" },
        ].map((stat) => (
          <div key={stat.label} className={clsx("rounded-xl p-4 border", stat.color, "border-opacity-20")}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm mt-1 opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/ledger/create"
            className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("create")}
          </Link>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("filter.all")} {t("filter.status")}</option>
            <option value="active">{t("status.active")}</option>
            <option value="archived">{t("status.archived")}</option>
          </select>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("filter.all")} {t("filter.category")}</option>
            {categories.map((c: { id: string; level1: string; level2: string }) => (
              <option key={c.id} value={c.id}>{c.level1} / {c.level2}</option>
            ))}
          </select>

          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder={t("filter.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{tCommon("loading")}</div>
        ) : ledgers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{tCommon("noData")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  t("fields.internalBatchNo"),
                  t("fields.productName"),
                  t("fields.batchNo"),
                  t("fields.category"),
                  t("fields.certExpiryDate"),
                  t("fields.effectiveExpiryDate"),
                  t("fields.status"),
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ledgers.map((ledger: Record<string, unknown>) => {
                const daysLeft = Math.ceil(
                  (new Date(ledger.effective_expiry_date as string).getTime() - Date.now()) / 86400000
                );
                return (
                  <tr key={ledger.id as string} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/ledger/${ledger.id}`} className="text-blue-700 hover:underline">
                        {ledger.internal_batch_no as string}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium">{ledger.product_name as string}</td>
                    <td className="px-4 py-3 text-gray-500">{ledger.batch_no as string}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {(ledger.category as { level2: string }).level2}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {(ledger.cert_expiry_date as string).slice(0, 10)}
                    </td>
                    <td className={clsx("px-4 py-3", daysLeft <= 30 ? "text-amber-600 font-medium" : "text-gray-500")}>
                      {(ledger.effective_expiry_date as string).slice(0, 10)}
                      {daysLeft <= 30 && daysLeft >= 0 && (
                        <span className="ml-1 text-xs">({daysLeft}d)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        "inline-block px-2 py-0.5 rounded text-xs font-medium",
                        ledger.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}>
                        {t(`status.${ledger.status}`)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
