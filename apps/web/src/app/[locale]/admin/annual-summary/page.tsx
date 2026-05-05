"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminAnnualSummaryApi, AnnualSummary } from "@/lib/api-client";
import clsx from "clsx";

const SECTIONS = [
  { key: "sample_testing", label: "样品检测", icon: "📊" },
  { key: "method_dev", label: "方法开发&验证", icon: "🔬" },
  { key: "stability_test", label: "稳定性试验", icon: "🧪" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

interface EditItem {
  id?: string;
  category: string;
  project_count: number;
  project_names: string;
  batch_count: number;
  yoy_growth: string;
}

export default function AdminAnnualSummaryPage() {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<EditItem[]>([]);

  // Fetch all years for trend chart
  const { data: allData } = useQuery({
    queryKey: ["admin-annual-summaries-all"],
    queryFn: () => adminAnnualSummaryApi.list().then((r) => r.data),
  });

  // Fetch current year data
  const { data: yearData, isLoading } = useQuery({
    queryKey: ["admin-annual-summaries", selectedYear],
    queryFn: () => adminAnnualSummaryApi.getByYear(selectedYear).then((r) => r.data),
  });

  // Group data by section
  const sectionData = useMemo(() => {
    const grouped: Record<string, AnnualSummary[]> = {};
    SECTIONS.forEach((s) => {
      grouped[s.key] = (yearData ?? []).filter((d) => d.section === s.key);
    });
    return grouped;
  }, [yearData]);

  // Trend data for chart (all years sample_testing total batch count)
  const trendData = useMemo(() => {
    const dataByYear: Record<number, { year: number; batch_count: number; project_count: number }> = {};
    (allData ?? []).forEach((item) => {
      if (item.section === "sample_testing") {
        if (!dataByYear[item.year]) {
          dataByYear[item.year] = { year: item.year, batch_count: 0, project_count: 0 };
        }
        dataByYear[item.year].batch_count += item.batch_count;
        dataByYear[item.year].project_count += item.project_count;
      }
    });
    return Object.values(dataByYear).sort((a, b) => a.year - b.year);
  }, [allData]);

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof adminAnnualSummaryApi.create>[0]) =>
      adminAnnualSummaryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-annual-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["admin-annual-summaries-all"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminAnnualSummaryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-annual-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["admin-annual-summaries-all"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminAnnualSummaryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-annual-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["admin-annual-summaries-all"] });
    },
  });

  const handleEditSection = (sectionKey: string) => {
    const items = sectionData[sectionKey] || [];
    setEditItems(
      items.length > 0
        ? items.map((item) => ({
            id: item.id,
            category: item.category || "",
            project_count: item.project_count,
            project_names: item.project_names || "",
            batch_count: item.batch_count,
            yoy_growth: item.yoy_growth || "",
          }))
        : [{ category: "", project_count: 0, project_names: "", batch_count: 0, yoy_growth: "" }]
    );
    setEditingSection(sectionKey);
  };

  const handleAddItem = () => {
    setEditItems([
      ...editItems,
      { category: "", project_count: 0, project_names: "", batch_count: 0, yoy_growth: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof EditItem, value: string | number) => {
    const newItems = [...editItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditItems(newItems);
  };

  const handleSave = async () => {
    if (!editingSection) return;

    // Delete existing items for this section/year, then create new ones
    const existing = sectionData[editingSection] || [];
    for (const item of existing) {
      await deleteMutation.mutateAsync(item.id);
    }

    // Create new items
    for (const item of editItems) {
      if (item.category.trim()) {
        await createMutation.mutateAsync({
          year: selectedYear,
          section: editingSection,
          category: item.category,
          project_count: item.project_count,
          project_names: item.project_names || undefined,
          batch_count: item.batch_count,
          yoy_growth: item.yoy_growth || undefined,
        });
      }
    }

    setEditingSection(null);
  };

  const getTotalStats = (sectionKey: string) => {
    const items = sectionData[sectionKey] || [];
    return {
      projectCount: items.reduce((sum, i) => sum + i.project_count, 0),
      batchCount: items.reduce((sum, i) => sum + i.batch_count, 0),
    };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">年度总结数据维护</h1>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">📊 样品检测趋势</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="batch_count" fill="#3b82f6" name="批次数" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Section Cards */}
        <div className="grid gap-6">
          {SECTIONS.map((section) => {
            const stats = getTotalStats(section.key);
            const items = sectionData[section.key] || [];

            return (
              <div
                key={section.key}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <h3 className="text-lg font-semibold text-slate-900">{section.label}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">
                      {stats.projectCount} 个项目 | {stats.batchCount} 批
                    </span>
                    <button
                      onClick={() => handleEditSection(section.key)}
                      className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      编辑
                    </button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="px-6 py-8 text-center text-slate-400">暂无数据，点击编辑添加</div>
                ) : (
                  <div className="px-6 py-4 space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-slate-800">{item.category}</span>
                          {item.project_names && (
                            <span className="ml-2 text-sm text-slate-500">
                              ({item.project_names.split(",").length} 个项目)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-slate-600">{item.project_count} 项目</span>
                          <span className="text-slate-600">{item.batch_count} 批</span>
                          {item.yoy_growth && (
                            <span
                              className={clsx(
                                "font-medium",
                                item.yoy_growth.startsWith("+")
                                  ? "text-green-600"
                                  : item.yoy_growth.startsWith("-")
                                  ? "text-red-600"
                                  : "text-slate-600"
                              )}
                            >
                              {item.yoy_growth}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                编辑 {SECTIONS.find((s) => s.key === editingSection)?.label} 数据
              </h3>
              <button
                onClick={() => setEditingSection(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">年份: {selectedYear}</span>
                  <button
                    onClick={handleAddItem}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + 添加检测类型
                  </button>
                </div>

                {editItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="检测类型"
                        value={item.category}
                        onChange={(e) => handleItemChange(index, "category", e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="ml-3 text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">项目数</label>
                        <input
                          type="number"
                          value={item.project_count}
                          onChange={(e) => handleItemChange(index, "project_count", Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">批次数</label>
                        <input
                          type="number"
                          value={item.batch_count}
                          onChange={(e) => handleItemChange(index, "batch_count", Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">同比增长率</label>
                        <input
                          type="text"
                          placeholder="如 +22%"
                          value={item.yoy_growth}
                          onChange={(e) => handleItemChange(index, "yoy_growth", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">项目名称（逗号分隔）</label>
                        <input
                          type="text"
                          placeholder="项目1, 项目2, ..."
                          value={item.project_names}
                          onChange={(e) => handleItemChange(index, "project_names", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {editItems.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    点击"添加检测类型"开始添加数据
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || deleteMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}