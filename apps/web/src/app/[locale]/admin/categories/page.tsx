"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { categoryApi } from "@/lib/api-client";

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

type CreateState = {
  level1: string;
  level2: string;
  warning_threshold_days: number;
  unopened_shelf_months: number;
  opened_shelf_months: number;
  remarks: string;
};

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

function StatBadge({ value, label, color }: { value: number; label: string; color: "blue" | "teal" }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 rounded text-sm font-mono-custom font-medium ${
        color === "blue" ? "bg-blue-500/15 text-blue-600" : "bg-teal-500/15 text-teal-600"
      }`}>
        {value}
      </span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 modal-animate overflow-hidden border border-slate-200">
        <div className="relative px-6 py-5 border-b border-slate-100">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-400 to-transparent"></div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 font-mono-custom">删除品类</h2>
              <p className="text-xs text-slate-500 mt-0.5">此操作不可撤销</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-700">
            确定要删除品类 <strong className="font-mono-custom text-blue-600">{category.level1} - {category.level2}</strong> 吗？
          </p>
          <p className="text-sm text-slate-500 mt-2">
            如果该品类下有台账记录，将无法删除。
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-all"
            >
              {isPending ? "删除中..." : "确认删除"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-all"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateModal({
  open,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateState) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<CreateState>({
    level1: "",
    level2: "",
    warning_threshold_days: 30,
    unopened_shelf_months: 12,
    opened_shelf_months: 3,
    remarks: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        level1: "",
        level2: "",
        warning_threshold_days: 30,
        unopened_shelf_months: 12,
        opened_shelf_months: 3,
        remarks: "",
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg modal-animate shadow-xl border border-slate-200 overflow-hidden">
        <div className="relative px-6 py-5 border-b border-slate-100">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent"></div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 font-mono-custom">新增品类</h2>
              <p className="text-xs text-slate-500 mt-0.5">创建新的品类配置</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">一级品类 *</label>
              <input
                type="text"
                placeholder="输入一级品类"
                value={form.level1}
                onChange={(e) => setForm((f) => ({ ...f, level1: e.target.value }))}
                className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">二级品类 *</label>
              <input
                type="text"
                placeholder="输入二级品类"
                value={form.level2}
                onChange={(e) => setForm((f) => ({ ...f, level2: e.target.value }))}
                className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">预警天数</label>
            <input
              type="number"
              value={form.warning_threshold_days}
              onChange={(e) => setForm((f) => ({ ...f, warning_threshold_days: parseInt(e.target.value) || 0 }))}
              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono-custom text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">未开封有效期（月）</label>
              <input
                type="number"
                value={form.unopened_shelf_months}
                onChange={(e) => setForm((f) => ({ ...f, unopened_shelf_months: parseInt(e.target.value) || 0 }))}
                className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono-custom text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">已开封有效期（月）</label>
              <input
                type="number"
                value={form.opened_shelf_months}
                onChange={(e) => setForm((f) => ({ ...f, opened_shelf_months: parseInt(e.target.value) || 0 }))}
                className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono-custom text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">备注</label>
            <input
              type="text"
              placeholder="可选备注信息"
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-all"
          >
            取消
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={isPending || !form.level1.trim() || !form.level2.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? "创建中..." : "创建"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({
  open,
  onClose,
  editState,
  onSave,
  onChange,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  editState: EditState | null;
  onSave: () => void;
  onChange: (s: EditState) => void;
  isPending: boolean;
}) {
  if (!open || !editState) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg modal-animate shadow-xl border border-slate-200 overflow-hidden">
        <div className="relative px-6 py-5 border-b border-slate-100">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent"></div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 font-mono-custom">编辑品类</h2>
              <p className="text-xs text-slate-500 mt-0.5">修改品类配置信息</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">预警天数</label>
            <input
              type="number"
              value={editState.warning_threshold_days}
              onChange={(e) => onChange({ ...editState, warning_threshold_days: parseInt(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono-custom text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">未开封有效期（月）</label>
              <input
                type="number"
                value={editState.unopened_shelf_months}
                onChange={(e) => onChange({ ...editState, unopened_shelf_months: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono-custom text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">已开封有效期（月）</label>
              <input
                type="number"
                value={editState.opened_shelf_months}
                onChange={(e) => onChange({ ...editState, opened_shelf_months: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono-custom text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">备注</label>
            <input
              type="text"
              placeholder="可选备注信息"
              value={editState.remarks}
              onChange={(e) => onChange({ ...editState, remarks: e.target.value })}
              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 font-mono-custom focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-all"
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? "保存中..." : "保存"}
          </button>
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => categoryApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof categoryApi.create>[0]) =>
      categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setCreateModalOpen(false);
      setActionMsg("品类创建成功");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: () => setActionMsg("创建失败"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryApi.update(id, data),
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

  const totalCategories = categories.length;
  const level1Count = new Set(categories.map((c: Category) => c.level1)).size;
  const level2Count = totalCategories;

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
        .font-body-custom { font-family: 'IBM Plex Sans', sans-serif; }
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes headerSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .card-enter { animation: cardEnter 0.5s ease-out forwards; opacity: 0; }
        .modal-animate { animation: modalSlideUp 0.35s ease-out forwards; }
        .header-slide { animation: headerSlideIn 0.4s ease-out forwards; }
        .modal-overlay {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
      `}</style>

      <div className="min-h-screen bg-background font-body-custom">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 header-slide">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 font-mono-custom tracking-tight">
                品类配置
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent rounded"></span>
                <span className="text-xs text-slate-500 font-mono-custom">CATEGORY CONFIG</span>
              </div>
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium font-mono-custom bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新增品类
            </button>
          </div>

          {/* Action message */}
          {actionMsg && (
            <div
              className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                actionMsg.includes("成功")
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {actionMsg}
            </div>
          )}

          {/* Stats Row */}
          {!isLoading && categories.length > 0 && (
            <div className="flex items-center gap-6 card-enter" style={{ animationDelay: "0.1s" }}>
              <StatBadge value={totalCategories} label="总品类数" color="blue" />
              <StatBadge value={level1Count} label="一级品类" color="teal" />
              <StatBadge value={level2Count} label="二级品类" color="blue" />
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                <p className="text-sm text-slate-500">加载中...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center card-enter">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">暂无品类数据</p>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  点击添加第一个品类
                </button>
              </div>
            ) : (
              categories.map((c: Category, index: number) => {
                const isEditing = editingId === c.id;
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden card-enter"
                    style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{c.level1}</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-sm text-slate-600">{c.level2}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono-custom">#{c.id.slice(0, 8)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs text-slate-500">预警天数</span>
                            <div className="font-mono-custom text-sm font-medium text-amber-600">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editState?.warning_threshold_days ?? c.warning_threshold_days}
                                  onChange={(e) =>
                                    setEditState((prev) =>
                                      prev ? { ...prev, warning_threshold_days: parseInt(e.target.value) || 0 } : null
                                    )
                                  }
                                  className="w-20 px-2 py-1 border border-slate-300 rounded text-amber-600 text-right"
                                />
                              ) : (
                                `${c.warning_threshold_days}天`
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-500">未开封</span>
                            <div className="font-mono-custom text-sm text-slate-600">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editState?.unopened_shelf_months ?? c.unopened_shelf_months}
                                  onChange={(e) =>
                                    setEditState((prev) =>
                                      prev ? { ...prev, unopened_shelf_months: parseInt(e.target.value) || 0 } : null
                                    )
                                  }
                                  className="w-20 px-2 py-1 border border-slate-300 rounded text-slate-600 text-right"
                                />
                              ) : (
                                `${c.unopened_shelf_months}月`
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-500">已开封</span>
                            <div className="font-mono-custom text-sm text-slate-600">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editState?.opened_shelf_months ?? c.opened_shelf_months}
                                  onChange={(e) =>
                                    setEditState((prev) =>
                                      prev ? { ...prev, opened_shelf_months: parseInt(e.target.value) || 0 } : null
                                    )
                                  }
                                  className="w-20 px-2 py-1 border border-slate-300 rounded text-slate-600 text-right"
                                />
                              ) : (
                                `${c.opened_shelf_months}月`
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEdit}
                                disabled={updateMutation.isPending}
                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                              >
                                {updateMutation.isPending ? "保存中..." : "保存"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1.5 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                              >
                                取消
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(c)}
                                className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => setDeleteTarget(c)}
                                className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                              >
                                删除
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remarks row */}
                    {!isEditing && c.remarks && (
                      <div className="px-5 py-2.5 bg-slate-50 text-xs text-slate-500">
                        备注: {c.remarks}
                      </div>
                    )}
                    {isEditing && (
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                        <input
                          type="text"
                          placeholder="备注信息"
                          value={editState?.remarks ?? ""}
                          onChange={(e) =>
                            setEditState((prev) => (prev ? { ...prev, remarks: e.target.value } : null))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono-custom text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />

      {/* Edit Modal */}
      <EditModal
        open={editingId !== null}
        onClose={cancelEdit}
        editState={editState}
        onSave={saveEdit}
        onChange={setEditState}
        isPending={updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
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
