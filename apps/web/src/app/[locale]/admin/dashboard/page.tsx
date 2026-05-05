"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminLedgerApi, auditLogApi } from "@/lib/api-client";
import { format } from "date-fns";

interface DashboardStats {
  overview: {
    total: number;
    active: number;
    archived: number;
    expiring_7d: number;
    expiring_30d: number;
  };
  this_month_new: number;
  low_stock_count: number;
}

interface ExpiringLedger {
  id: string;
  product_name: string;
  category: { level2: string };
  effective_expiry_date: string;
  days_remaining: number;
  quantity: number;
}

interface AuditLog {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
  user?: { username: string };
}

type ExpiryFilter = 30 | 60 | 90;

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiringLedgers, setExpiringLedgers] = useState<ExpiringLedger[]>([]);
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>(30);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      try {
        // Fetch dashboard stats
        const statsRes = await fetch(`${apiUrl}/admin/dashboard/stats`, {
          credentials: "include",
        });
        const statsData = await statsRes.json();

        // Calculate this month new count
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthNew = statsData.overview?.active || 0; // Placeholder - would need API support

        setStats({
          overview: statsData.overview || {
            total: 0,
            active: 0,
            archived: 0,
            expiring_7d: 0,
            expiring_30d: 0,
          },
          this_month_new: thisMonthNew,
          low_stock_count: 0, // Would need API support
        });

        // Fetch expiring ledgers
        const today = new Date();
        const filterDate = new Date(today);
        filterDate.setDate(filterDate.getDate() + expiryFilter);

        const ledgersRes = await adminLedgerApi.list({
          status: "active",
          page: 1,
          page_size: 100,
        });

        const allLedgers = ledgersRes.data.items;
        const expiring = allLedgers
          .filter((ledger) => {
            const expiryDate = new Date(ledger.effective_expiry_date);
            return expiryDate <= filterDate && expiryDate >= today;
          })
          .map((ledger) => {
            const daysRemaining = Math.ceil(
              (new Date(ledger.effective_expiry_date).getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return { ...ledger, days_remaining: daysRemaining };
          })
          .sort(
            (a, b) =>
              a.days_remaining - b.days_remaining
          )
          .slice(0, 10);

        setExpiringLedgers(expiring);

        // Fetch recent audit logs
        const auditRes = await auditLogApi.list({ page_size: 10 });
        setRecentActivity(auditRes.data.items);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [expiryFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">仪表板</h1>
        <p className="text-slate-500 text-sm mt-1">QC管理后台概览</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="台账总数"
          value={stats?.overview.total || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          accentColor="blue"
        />
        <KPICard
          title="本月新增"
          value={stats?.this_month_new || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
          accentColor="teal"
        />
        <KPICard
          title="已归档"
          value={stats?.overview.archived || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          }
          accentColor="slate"
        />
        <KPICard
          title="即将到期"
          value={stats?.overview.expiring_7d || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          accentColor="red"
        />
        <KPICard
          title="库存不足"
          value={stats?.low_stock_count || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          accentColor="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry Alert Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">到期提醒</h2>
            <div className="flex gap-2">
              {([30, 60, 90] as ExpiryFilter[]).map((days) => (
                <button
                  key={days}
                  onClick={() => setExpiryFilter(days)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    expiryFilter === days
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {days}天
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    试剂
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    品类
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    到期日期
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    剩余天数
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expiringLedgers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      暂无到期提醒
                    </td>
                  </tr>
                ) : (
                  expiringLedgers.map((ledger) => (
                    <tr key={ledger.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                        {ledger.product_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {ledger.category?.level2 || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {format(new Date(ledger.effective_expiry_date), "yyyy-MM-dd")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ledger.days_remaining <= 7
                              ? "bg-red-100 text-red-800"
                              : ledger.days_remaining <= 30
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {ledger.days_remaining}天
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/ledger/${ledger.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          查看
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">最近操作</h2>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-center text-slate-500 py-8">暂无操作记录</p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-4">
                  {recentActivity.map((log) => (
                    <div key={log.id} className="relative pl-8">
                      {/* Timeline dot */}
                      <div className="absolute left-3 top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">
                            {log.action}
                          </span>
                          <span className="text-xs text-slate-500">
                            {log.target_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {log.user?.username || "系统"} •{" "}
                          {format(new Date(log.created_at), "MM-dd HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  accentColor: "blue" | "teal" | "slate" | "red" | "orange";
}

function KPICard({ title, value, icon, accentColor }: KPICardProps) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-200",
    },
    teal: {
      bg: "bg-teal-50",
      icon: "text-teal-600",
      border: "border-teal-200",
    },
    slate: {
      bg: "bg-slate-50",
      icon: "text-slate-600",
      border: "border-slate-200",
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
      border: "border-red-200",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      border: "border-orange-200",
    },
  };

  const colors = colorMap[accentColor];

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`${colors.icon}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </div>
      <p className="text-sm text-slate-600 mt-1">{title}</p>
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
