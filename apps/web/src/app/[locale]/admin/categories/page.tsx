"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Link } from "@/i18n/navigation";

type Category = {
  id: string;
  level1: string;
  level2: string;
  warning_threshold_days: number;
  unopened_shelf_months: number;
  opened_shelf_months: number;
  remarks?: string;
};

type EditState = {
  id: string;
  warning_threshold_days: number;
  unopened_shelf_months: number;
  opened_shelf_months: number;
  remarks: string;
};

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list().then((r) => r.data),
    enabled: isAdmin(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingId(null);
      setEditState(null);
    },
  });

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditState({
      id: c.id,
      warning_threshold_days: c.warning_threshold_days,
      unopened_shelf_months: c.unopened_shelf_months,
      opened_shelf_months: c.opened_shelf_months,
      remarks: c.remarks || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  const saveEdit = () => {
    if (!editState) return;
    updateMutation.mutate({
      id: editState.id,
      data: {
        warning_threshold_days: editState.warning_threshold_days,
        unopened_shelf_months: editState.unopened_shelf_months,
        opened_shelf_months: editState.opened_shelf_months,
        remarks: editState.remarks,
      },
    });
  };

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
              {["一级品类", "二级品类", "预警天数", "未开封月数", "已开封月数", "备注", "操作"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c: Category) => {
              const isEditing = editingId === c.id;
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.level1}</td>
                  <td className="px-4 py-3">{c.level2}</td>
                  {isEditing ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editState?.warning_threshold_days ?? c.warning_threshold_days}
                          onChange={(e) => setEditState((prev) => prev ? { ...prev, warning_threshold_days: parseInt(e.target.value) || 0 } : null)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-amber-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editState?.unopened_shelf_months ?? c.unopened_shelf_months}
                          onChange={(e) => setEditState((prev) => prev ? { ...prev, unopened_shelf_months: parseInt(e.target.value) || 0 } : null)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-gray-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={editState?.opened_shelf_months ?? c.opened_shelf_months}
                          onChange={(e) => setEditState((prev) => prev ? { ...prev, opened_shelf_months: parseInt(e.target.value) || 0 } : null)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-gray-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editState?.remarks ?? c.remarks ?? ""}
                          onChange={(e) => setEditState((prev) => prev ? { ...prev, remarks: e.target.value } : null)}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            {updateMutation.isPending ? "保存中..." : "保存"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            取消
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-amber-600">{c.warning_threshold_days}天</td>
                      <td className="px-4 py-3 text-gray-500">{c.unopened_shelf_months}月</td>
                      <td className="px-4 py-3 text-gray-500">{c.opened_shelf_months}月</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{c.remarks || "-"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => startEdit(c)}
                          className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          编辑
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
