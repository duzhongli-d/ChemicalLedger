"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";

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

function DeleteConfirmModal({
  open,
  onClose,
  category,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  category?: Category;
  onConfirm: () => void;
  isPending: boolean;
}) {
  if (!open || !category) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">删除品类</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6">
          <p className="text-slate-700">
            确定要删除品类 <strong>{category.level1} - {category.level2}</strong> 吗？
          </p>
          <p className="text-sm text-slate-500 mt-2">
            如果该品类下有台账记录，将无法删除。
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? "删除中..." : "确认删除"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | undefined>();
  const [actionMsg, setActionMsg] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      return fetch(`${apiUrl}/categories/`, { credentials: "include" }).then((r) => r.json());
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/categories/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      ).then((r) => {
        if (!r.ok) throw new Error("更新失败");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditingId(null);
      setEditState(null);
      setActionMsg("品类更新成功");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: () => setActionMsg("更新失败"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/categories/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      ).then((r) => {
        if (!r.ok) throw new Error("删除失败");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setDeleteTarget(undefined);
      setActionMsg("品类删除成功");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: (err: Error) => {
      setDeleteTarget(undefined);
      setActionMsg(err.message || "删除失败");
      setTimeout(() => setActionMsg(""), 5000);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">品类配置</h1>
        </div>

        {/* Action message */}
        {actionMsg && (
          <div
            className={`px-4 py-2 rounded-lg text-sm ${
              actionMsg.includes("成功")
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {actionMsg}
          </div>
        )}

        {/* Categories table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">加载中...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    一级品类
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    二级品类
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    预警天数
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    未开封有效期
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    已开封有效期
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    备注
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      暂无品类数据
                    </td>
                  </tr>
                ) : (
                  categories.map((c: Category) => {
                    const isEditing = editingId === c.id;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {c.level1}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{c.level2}</td>
                        {isEditing ? (
                          <>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={
                                  editState?.warning_threshold_days ??
                                  c.warning_threshold_days
                                }
                                onChange={(e) =>
                                  setEditState((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          warning_threshold_days:
                                            parseInt(e.target.value) || 0,
                                        }
                                      : null
                                  )
                                }
                                className="w-20 px-2 py-1 border border-slate-300 rounded text-amber-600"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={
                                  editState?.unopened_shelf_months ??
                                  c.unopened_shelf_months
                                }
                                onChange={(e) =>
                                  setEditState((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          unopened_shelf_months:
                                            parseInt(e.target.value) || 0,
                                        }
                                      : null
                                  )
                                }
                                className="w-20 px-2 py-1 border border-slate-300 rounded text-slate-600"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={
                                  editState?.opened_shelf_months ??
                                  c.opened_shelf_months
                                }
                                onChange={(e) =>
                                  setEditState((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          opened_shelf_months:
                                            parseInt(e.target.value) || 0,
                                        }
                                      : null
                                  )
                                }
                                className="w-20 px-2 py-1 border border-slate-300 rounded text-slate-600"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={editState?.remarks ?? c.remarks ?? ""}
                                onChange={(e) =>
                                  setEditState((prev) =>
                                    prev ? { ...prev, remarks: e.target.value } : null
                                  )
                                }
                                className="w-32 px-2 py-1 border border-slate-300 rounded text-xs"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEdit}
                                  disabled={updateMutation.isPending}
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {updateMutation.isPending ? "保存中..." : "保存"}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                                >
                                  取消
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-amber-600">
                              {c.warning_threshold_days}天
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {c.unopened_shelf_months}月
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {c.opened_shelf_months}月
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs">
                              {c.remarks || "-"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => startEdit(c)}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(c)}
                                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                                >
                                  删除
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        category={deleteTarget}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isPending={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
