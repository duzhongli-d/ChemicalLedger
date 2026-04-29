"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AdminLayout from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/layout/StatCard";

interface DashboardStats {
  overview: {
    total: number;
    active: number;
    expiring_7d: number;
    archived: number;
  };
  trends: {
    total: number[];
    active: number[];
    expiring: number[];
    archived: number[];
  };
}

function DashboardContent() {
  const t = useTranslations("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/dashboard/stats", { credentials: "include" })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("dashboard") || "数据统计"}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("totalLedgers") || "总台账"}
          value={stats.overview.total}
          trend={stats.trends.total}
          accentColor="orange"
        />
        <StatCard
          title={t("activeLedgers") || "有效中"}
          value={stats.overview.active}
          trend={stats.trends.active}
          accentColor="teal"
        />
        <StatCard
          title={t("expiringSoon") || "7天内过期"}
          value={stats.overview.expiring_7d}
          trend={stats.trends.expiring}
          accentColor="amber"
        />
        <StatCard
          title={t("archivedLedgers") || "已归档"}
          value={stats.overview.archived}
          trend={stats.trends.archived}
          accentColor="slate"
        />
      </div>

      {/* Placeholder for additional charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">趋势图表</h2>
          <p className="text-gray-500 text-sm">更多图表组件将在后续添加</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">最近活动</h2>
          <p className="text-gray-500 text-sm">活动列表将在后续添加</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}
