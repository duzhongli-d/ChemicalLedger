"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminLedgerApi, categoryApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Link } from "@/i18n/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import clsx from "clsx";

export default function AdminLedgerEditPage() {
  const t = useTranslations("ledger");
  const tCommon = useTranslations("common");
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [form, setForm] = useState({
    product_name: "",
    batch_no: "",
    cas_no: "",
    weight_capacity: "",
    supplier: "",
    quantity: "1",
    category_id: "",
    cert_expiry_date: "",
    effective_expiry_date: "",
    status: "active",
    remarks: "",
  });
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch ledger data
  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ["admin-ledger", id],
    queryFn: () => adminLedgerApi.list({ page: 1, page_size: 100 }).then(async (r) => {
      const all = await adminLedgerApi.list({ page: 1, page_size: 100 }).then((res) => res.data);
      return all.items.find((l: { id: string }) => l.id === id);
    }),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => categoryApi.list().then((r) => r.data),
    enabled: isAuthenticated(),
  });

  // Pre-fill form when ledger loads
  useEffect(() => {
    if (ledger && !form.category_id) {
      setForm({
        product_name: ledger.product_name || "",
        batch_no: ledger.batch_no || "",
        cas_no: ledger.cas_no || "",
        weight_capacity: ledger.weight_capacity || "",
        supplier: ledger.supplier || "",
        quantity: String(ledger.quantity || "1"),
        category_id: ledger.category?.id || "",
        cert_expiry_date: ledger.cert_expiry_date?.slice(0, 10) || "",
        effective_expiry_date: ledger.effective_expiry_date?.slice(0, 10) || "",
        status: ledger.status || "active",
        remarks: ledger.remarks || "",
      });
    }
  }, [ledger, form.category_id]);

  const grouped = (categories as { level1: string; level2: string; id: string }[]).reduce<Record<string, typeof categories>>((acc, c) => {
    (acc[c.level1] = acc[c.level1] || []).push(c);
    return acc;
  }, {});

  const updateMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        ...form,
        quantity: Number(form.quantity),
      };
      Object.keys(payload).forEach((k) => payload[k] === "" && delete payload[k]);
      return adminLedgerApi.update(id, payload);
    },
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => router.push(`/admin/ledgers/${id}`), 1000);
    },
    onError: (err: unknown) => setError(err instanceof Error ? err.message : "更新失败"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) { router.push("/login"); return; }
    setError("");
    updateMutation.mutate();
  };

  const set = (key: string, value: string) => setForm({ ...form, [key]: value });

  if (ledgerLoading) {
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

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
      `}</style>

      <main className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/ledgers/${id}`}
            className="group flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-full bg-gradient-to-b from-blue-600 to-teal-500" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-mono-custom tracking-tight">{t("edit")}</h1>
              <p className="text-sm text-slate-500 font-mono-custom">{ledger.product_name}</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative card-enter">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent"></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-1 h-4 rounded-full bg-orange-500" />
                <h3 className="text-sm font-semibold text-slate-700">{t("basicInfo")}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t("fields.productName")} *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.product_name}
                    onChange={(e) => set("product_name", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                    placeholder="输入产品名称"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t("fields.batchNo")} *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.batch_no}
                    onChange={(e) => set("batch_no", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                    placeholder="批号"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t("fields.casNo")}
                  </label>
                  <input
                    type="text"
                    value={form.cas_no}
                    onChange={(e) => set("cas_no", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                    placeholder="CAS号"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t("fields.weightCapacity")}
                  </label>
                  <input
                    type="text"
                    value={form.weight_capacity}
                    onChange={(e) => set("weight_capacity", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                    placeholder="规格/容量"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t("fields.supplier")}
                  </label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={(e) => set("supplier", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                    placeholder="供应商"
                  />
                </div>
              </div>
            </div>

            {/* Classification Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-1 h-4 rounded-full bg-teal-500" />
                <h3 className="text-sm font-semibold text-slate-700">{t("classification")}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t("fields.category")} *
                  </label>
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => set("category_id", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                  >
                    <option value="">-- 选择品类 --</option>
                    {Object.entries(grouped).map(([level1, cats]) => (
                      <optgroup key={level1} label={level1}>
                        {(cats as { id: string; level2: string }[]).map((c) => (
                          <option key={c.id} value={c.id}>{c.level2}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t("fields.quantity")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => set("quantity", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-1 h-4 rounded-full bg-amber-500" />
                <h3 className="text-sm font-semibold text-slate-700">{t("effectiveExpiryInfo")}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t("fields.certExpiryDate")} *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.cert_expiry_date}
                    onChange={(e) => set("cert_expiry_date", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {t("fields.effectiveExpiryDate")} (Admin可编辑)
                  </label>
                  <input
                    type="date"
                    value={form.effective_expiry_date}
                    onChange={(e) => set("effective_expiry_date", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    状态
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                  >
                    <option value="active">使用中</option>
                    <option value="archived">已归档</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-1 h-4 rounded-full bg-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700">{t("fields.remarks")}</h3>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={form.remarks}
                  onChange={(e) => set("remarks", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow resize-none"
                  placeholder="添加备注信息..."
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-mono-custom">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-mono-custom">保存成功，即将跳转...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={updateMutation.isPending || saveSuccess}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {tCommon("loading")}
                  </>
                ) : saveSuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    保存成功
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {tCommon("save")}
                  </>
                )}
              </button>
              <Link
                href={`/admin/ledgers/${id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                {tCommon("cancel")}
              </Link>
            </div>
          </form>
        </div>
      </main>
    </AdminLayout>
  );
}