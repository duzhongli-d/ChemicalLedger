"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Link } from "@/i18n/navigation";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const { isAdmin } = useAuthStore();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list().then((r) => r.data),
    enabled: isAdmin(),
  });

  if (!isAdmin()) {
    return <div className="text-center py-12 text-red-500">需要管理员权限</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600">← {t("categories")}</Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("categories")}</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["一级品类", "二级品类", "预警天数", "未开封月数", "已开封月数", "备注"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c: { id: string; level1: string; level2: string; warning_threshold_days: number; unopened_shelf_months: number; opened_shelf_months: number; remarks?: string }) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.level1}</td>
                <td className="px-4 py-3">{c.level2}</td>
                <td className="px-4 py-3 text-amber-600">{c.warning_threshold_days}天</td>
                <td className="px-4 py-3 text-gray-500">{c.unopened_shelf_months}月</td>
                <td className="px-4 py-3 text-gray-500">{c.opened_shelf_months}月</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{c.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
