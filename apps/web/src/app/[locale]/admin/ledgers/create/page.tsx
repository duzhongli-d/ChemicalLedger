"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminLedgerApi, categoryApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Link } from "@/i18n/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminLedgerCreatePage() {
  const t = useTranslations("ledger");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [form, setForm] = useState({
    product_name: "",
    batch_no: "",
    cas_no: "",
    weight_capacity: "",
    supplier: "",
    quantity: "1",
    category_id: "",
    cert_expiry_date: "",
    remarks: "",
  });
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showExpiryInfo, setShowExpiryInfo] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => categoryApi.list().then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const grouped = (categories as { level1: string; level2: string; id: string }[]).reduce<Record<string, typeof categories>>((acc, c) => {
    (acc[c.level1] = acc[c.level1] || []).push(c);
    return acc;
  }, {});

  const createMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        ...form,
        quantity: Number(form.quantity),
      };
      Object.keys(payload).forEach((k) => payload[k] === "" && delete payload[k]);
      return adminLedgerApi.create(payload as Parameters<typeof adminLedgerApi.create>[0]);
    },
    onSuccess: (response) => {
      setSaveSuccess(true);
      const created = response.data[0];
      setTimeout(() => router.push(`/admin/ledgers/${created.id}`), 1000);
    },
    onError: (err: unknown) => setError(err instanceof Error ? err.message : "创建失败"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) { router.push("/login"); return; }
    if (!form.product_name || !form.batch_no || !form.category_id) {
      setError("请填写必填字段");
      return;
    }
    setError("");
    createMutation.mutate();
  };

  const set = (key: string, value: string) => setForm({ ...form, [key]: value });

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
      `}</style>

      <main className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
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
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-full bg-gradient-to-b from-blue-600 to-teal-500" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-mono-custom tracking-tight">{t("create")}台账</h1>
              <p className="text-sm text-slate-500 font-mono-custom">新建台账记录</p>
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
                    {t("fields.certExpiryDate")}
                  </label>
                  <input
                    type="date"
                    value={form.cert_expiry_date}
                    onChange={(e) => set("cert_expiry_date", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              {/* Expiry Info Box */}
              <button
                type="button"
                onClick={() => setShowExpiryInfo(!showExpiryInfo)}
                className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                有效截止日计算规则
              </button>
              {showExpiryInfo && (
                <div className="mt-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl">
                  <div className="text-xs text-amber-900/90">
                    {/* 规则1：新建台账时 */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-200/70 text-amber-800 text-[10px] font-bold">1</span>
                        <p className="font-semibold text-amber-800 text-[11px] tracking-wide uppercase">新建台账时</p>
                      </div>
                      <div className="ml-7 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">▸</span>
                          <span>SOP有效截止日期 = 创建日期 + 对应品类未开封有效期(月数)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">▸</span>
                          <span>证书有效期未填 → <span className="font-medium text-amber-700">有效截止日=</span>SOP有效截止日期</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">▸</span>
                          <span>证书有效期已填 → <span className="font-medium text-amber-700">有效截止日=</span>MIN(证书有效期, SOP有效截止日期)</span>
                        </div>
                      </div>
                    </div>
                    {/* 规则2：开封后动态更新 */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-orange-200/70 text-orange-800 text-[10px] font-bold">2</span>
                        <p className="font-semibold text-orange-800 text-[11px] tracking-wide uppercase">开封后动态更新</p>
                      </div>
                      <div className="ml-7 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5">▸</span>
                          <span>新SOP有效截止日期 = 开封日期 + 对应品类已开封有效期(月数)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5">▸</span>
                          <span>SOP有效截止日期 = MIN(原SOP有效截止日期, 新SOP有效截止日期)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5">▸</span>
                          <span>有效截止日 = MIN(原有效截止日, 新SOP有效截止日期)</span>
                        </div>
                      </div>
                    </div>
                    {/* 核心原则 */}
                    <div className="mt-3 pt-2 border-t border-amber-200/50">
                      <div className="flex items-center gap-2 px-2 py-1.5 bg-amber-100/60 rounded-lg">
                        <span className="text-amber-500">★</span>
                        <span className="font-medium text-amber-700 text-[11px]">核心原则：</span>
                        <span className="text-amber-600 text-[11px]">始终取最早失效时间（最小截止日）</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                <span className="font-mono-custom">创建成功，即将跳转...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending || saveSuccess}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {tCommon("loading")}
                  </>
                ) : saveSuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    创建成功
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    {tCommon("create")}
                  </>
                )}
              </button>
              <Link
                href="/admin/ledgers"
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