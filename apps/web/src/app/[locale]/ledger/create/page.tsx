"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { categoryApi, ledgerApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Link } from "@/i18n/navigation";

export default function CreateLedgerPage() {
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
    open_date: "",
    remarks: "",
  });
  const [error, setError] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list().then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const grouped = (categories as { level1: string; level2: string; id: string }[]).reduce<Record<string, typeof categories>>((acc, c) => {
    (acc[c.level1] = acc[c.level1] || []).push(c);
    return acc;
  }, {});

  const createMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, quantity: Number(form.quantity) };
      if (!payload.open_date) delete payload.open_date;
      return ledgerApi.create(payload);
    },
    onSuccess: () => router.push("/"),
    onError: (err: unknown) => setError(err instanceof Error ? err.message : "创建失败"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) { router.push("/login"); return; }
    setError("");
    createMutation.mutate();
  };

  const set = (key: string, value: string) => setForm({ ...form, [key]: value });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600">← {t("back")}</Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("createManual")}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.productName")} *</label>
              <input required type="text" value={form.product_name} onChange={(e) => set("product_name", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.batchNo")} *</label>
              <input required type="text" value={form.batch_no} onChange={(e) => set("batch_no", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.casNo")} *</label>
              <input required type="text" value={form.cas_no} onChange={(e) => set("cas_no", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.weightCapacity")} *</label>
              <input required type="text" value={form.weight_capacity} onChange={(e) => set("weight_capacity", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.supplier")} *</label>
              <input required type="text" value={form.supplier} onChange={(e) => set("supplier", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.quantity")}</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.category")} *</label>
              <select required value={form.category_id} onChange={(e) => set("category_id", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">-- 选择品类 --</option>
                {Object.entries(grouped).map(([level1, cats]) => (
                  <optgroup key={level1} label={level1}>
                    {cats.map((c: { id: string; level2: string }) => (
                      <option key={c.id} value={c.id}>{c.level2}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.certExpiryDate")} *</label>
              <input required type="date" value={form.cert_expiry_date} onChange={(e) => set("cert_expiry_date", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.openDate")}</label>
              <input type="date" value={form.open_date} onChange={(e) => set("open_date", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.remarks")}</label>
              <textarea rows={3} value={form.remarks} onChange={(e) => set("remarks", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50">
              {createMutation.isPending ? tCommon("loading") : tCommon("submit")}
            </button>
            <Link href="/"
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium text-center hover:bg-gray-50">
              {tCommon("cancel")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
