"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { categoryApi, ledgerApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Link } from "@/i18n/navigation";

export default function ScanLedgerPage() {
  const t = useTranslations("ledger");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [extracted, setExtracted] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);

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
    mutationFn: () => ledgerApi.create({ ...form, quantity: Number(form.quantity) }),
    onSuccess: () => router.push("/"),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Placeholder: real implementation calls /api/ocr endpoint
    const file = e.target.files?.[0];
    if (!file) return;
    // Simulate OCR result
    setExtracted({
      product_name: "示例试剂",
      batch_no: "LOT-2026-001",
      cas_no: "7732-18-5",
      weight_capacity: "500mL",
      supplier: "Sigma-Aldrich",
    });
    setConfirmed(false);
  };

  const applyExtracted = () => {
    setForm((prev) => ({ ...prev, ...extracted }));
    setConfirmed(true);
  };

  const set = (key: string, value: string) => setForm({ ...form, [key]: value });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ledger/create" className="text-gray-400 hover:text-gray-600">← {t("back")}</Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("createScan")}</h1>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors min-h-[200px]">
          <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500">点击上传试剂标签图片</p>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {/* OCR Result */}
      {extracted.product_name && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">识别结果</h3>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            {Object.entries(extracted).map(([k, v]) => (
              <div key={k}>
                <span className="text-gray-500">{k}:</span>
                <span className="ml-2 font-medium">{v}</span>
              </div>
            ))}
          </div>
          {!confirmed ? (
            <button onClick={applyExtracted}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
              确认并补充信息 →
            </button>
          ) : (
            <p className="text-green-600 text-sm font-medium">✓ 已确认，请在下方补充完整信息并提交</p>
          )}
        </div>
      )}

      {/* Full Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          className="space-y-4">
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
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50">
              {createMutation.isPending ? tCommon("loading") : tCommon("submit")}
            </button>
            <Link href="/ledger/create"
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium text-center hover:bg-gray-50">
              {tCommon("cancel")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
