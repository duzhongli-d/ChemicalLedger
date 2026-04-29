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
    expiring_30d: number;
    archived: number;
  };
  by_category: Array<{ category: string; count: number }>;
  by_user: Array<{ user: string; count: number }>;
}

function DashboardContent() {
  const t = useTranslations("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    fetch(`${apiUrl}/admin/dashboard/stats`, { credentials: "include" })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("totalLedgers")}
          value={stats.overview.total}
          accentColor="orange"
        />
        <StatCard
          title={t("activeLedgers")}
          value={stats.overview.active}
          accentColor="teal"
        />
        <StatCard
          title={t("expiringSoon")}
          value={stats.overview.expiring_7d}
          accentColor="amber"
        />
        <StatCard
          title={t("archivedLedgers")}
          value={stats.overview.archived}
          accentColor="slate"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">品类分布</h2>
          <ul className="space-y-2">
            {stats.by_category.map((c, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{c.category}</span>
                <span className="font-medium">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">用户创建排行</h2>
          <ul className="space-y-2">
            {stats.by_user.map((u, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{u.user}</span>
                <span className="font-medium">{u.count}</span>
              </li>
            ))}
          </ul>
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
