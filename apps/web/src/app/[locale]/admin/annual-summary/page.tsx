"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminAnnualSummaryApi, AnnualSummary } from "@/lib/api-client";
import clsx from "clsx";

const SECTIONS = [
  { key: "sample_testing", label: "样品检测", labelEn: "Sample Testing", iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { key: "method_dev", label: "方法开发&验证", labelEn: "Method Dev & Validation", iconPath: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
  { key: "stability_test", label: "稳定性试验", labelEn: "Stability Testing", iconPath: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
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
      <span className={clsx(
        "px-2 py-0.5 rounded text-sm font-mono font-medium",
        color === "blue" ? "bg-blue-500/15 text-blue-600" : "bg-teal-500/15 text-teal-600"
      )}>
        {value}
      </span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

function GrowthIndicator({ value }: { value: string }) {
  const isPositive = value.startsWith("+");
  const isNegative = value.startsWith("-");
  if (!isPositive && !isNegative) return null;
  return (
    <span className={clsx(
      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-mono font-medium",
      isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
    )}>
      {isPositive ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      )}
      {value}
    </span>
  );
}

export default function AdminAnnualSummaryPage() {
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { data: allData } = useQuery({
    queryKey: ["admin-annual-summaries-all"],
    queryFn: () => adminAnnualSummaryApi.list().then((r) => r.data),
  });

  const { data: yearData, isLoading } = useQuery({
    queryKey: ["admin-annual-summaries", selectedYear],
    queryFn: () => adminAnnualSummaryApi.getByYear(selectedYear).then((r) => r.data),
  });

  const sectionData = useMemo(() => {
    const grouped: Record<string, AnnualSummary[]> = {};
    SECTIONS.forEach((s) => {
      grouped[s.key] = (yearData ?? []).filter((d) => d.section === s.key);
    });
    return grouped;
  }, [yearData]);

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
    const existing = sectionData[editingSection] || [];
    for (const item of existing) {
      await deleteMutation.mutateAsync(item.id);
    }
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
        .font-body-custom { font-family: 'IBM Plex Sans', sans-serif; }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
        .bar-animate { transform-origin: bottom; animation: barGrow 0.6s ease-out forwards; }
        .count-animate { animation: countUp 0.4s ease-out forwards; }
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
                年度总结数据维护
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent rounded"></span>
                <span className="text-xs text-slate-500 font-mono-custom">ANNUAL SUMMARY</span>
              </div>
            </div>

            {/* Year Selector */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none bg-white border border-slate-200 text-slate-900 px-4 py-2.5 pl-10 pr-10 rounded-lg font-mono-custom text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:border-slate-300"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-white">{y}</option>
                ))}
              </select>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Trend Chart */}
          {trendData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 card-enter" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 font-mono-custom">批次趋势</h2>
                  <p className="text-xs text-slate-500">样品检测年批次量统计</p>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} barCategoryGap="30%">
                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#64748b"
                      fontSize={12}
                      fontFamily="JetBrains Mono"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      fontFamily="JetBrains Mono"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        color: "#1e293b",
                        fontFamily: "JetBrains Mono",
                        fontSize: "12px",
                      }}
                      cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                    />
                    <Bar
                      dataKey="batch_count"
                      fill="url(#blueGrad)"
                      name="批次数"
                      radius={[4, 4, 0, 0]}
                      className="bar-animate"
                    >
                      {trendData.map((_, index) => (
                        <Cell key={index} style={{ animationDelay: `${index * 0.1}s` }} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Section Cards */}
          <div className="grid gap-5">
            {SECTIONS.map((section, sectionIndex) => {
              const stats = getTotalStats(section.key);
              const items = sectionData[section.key] || [];

              return (
                <div
                  key={section.key}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden card-enter"
                  style={{ animationDelay: `${0.2 + sectionIndex * 0.1}s` }}
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={section.iconPath} />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 font-mono-custom">{section.label}</h3>
                        <p className="text-xs text-slate-500">{section.labelEn}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4">
                        <StatBadge value={stats.projectCount} label="项目" color="blue" />
                        <StatBadge value={stats.batchCount} label="批次" color="teal" />
                      </div>
                      <button
                        onClick={() => handleEditSection(section.key)}
                        className="px-4 py-1.5 rounded-xl text-sm font-medium font-mono-custom bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                      >
                        编辑
                      </button>
                    </div>
                  </div>

                  {/* Section Content */}
                  {items.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500">暂无数据，点击编辑添加</p>
                    </div>
                  ) : (
                    <div className="px-6 py-4 space-y-2">
                      {items.map((item, itemIndex) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-3 px-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                          style={{ animationDelay: `${0.4 + sectionIndex * 0.1 + itemIndex * 0.05}s` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-slate-900 font-medium">{item.category}</span>
                            {item.project_names && (
                              <span className="text-xs text-slate-500 ml-2">
                                ({item.project_count} 个项目)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-5">
                            <span className="text-xs text-slate-500 font-mono-custom">
                              {item.project_count} 项目
                            </span>
                            <span className="text-xs text-slate-500 font-mono-custom">
                              {item.batch_count} 批
                            </span>
                            <GrowthIndicator value={item.yoy_growth || ""} />
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
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden modal-animate shadow-xl border border-slate-200">
            {/* Modal Header */}
            <div className="relative px-6 py-5 border-b border-slate-100">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent"></div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 font-mono-custom">
                    编辑 {SECTIONS.find((s) => s.key === editingSection)?.label} 数据
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedYear} 年度数据</p>
                </div>
                <button
                  onClick={() => setEditingSection(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-slate-500 font-mono-custom">
                  共 {editItems.length} 条记录
                </span>
                <button
                  onClick={handleAddItem}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  添加检测类型
                </button>
              </div>

              <div className="space-y-4">
                {editItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600/70 font-mono-custom">#{index + 1}</span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-xs text-red-500/70 hover:text-red-600 transition-colors"
                      >
                        删除
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">检测类型</label>
                      <input
                        type="text"
                        placeholder="输入检测类型名称"
                        value={item.category}
                        onChange={(e) => handleItemChange(index, "category", e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">项目数</label>
                        <input
                          type="number"
                          value={item.project_count}
                          onChange={(e) => handleItemChange(index, "project_count", Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono-custom text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">批次数</label>
                        <input
                          type="number"
                          value={item.batch_count}
                          onChange={(e) => handleItemChange(index, "batch_count", Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono-custom text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">同比增长率</label>
                        <input
                          type="text"
                          placeholder="如 +22%"
                          value={item.yoy_growth}
                          onChange={(e) => handleItemChange(index, "yoy_growth", e.target.value)}
                          className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono-custom text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">项目名称（逗号分隔）</label>
                        <input
                          type="text"
                          placeholder="项目1, 项目2, ..."
                          value={item.project_names}
                          onChange={(e) => handleItemChange(index, "project_names", e.target.value)}
                          className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {editItems.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500">点击&quot;添加检测类型&quot;开始添加数据</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setEditingSection(null)}
                className="px-5 py-2.5 text-sm text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || deleteMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
