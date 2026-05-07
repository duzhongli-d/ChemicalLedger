"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import clsx from "clsx";
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

type ExpiryFilter = 10 | 20 | 30;

// ─── Animation Helpers ───────────────────────────────────────────────────────

/** Count-up animation hook: animates from 0 to `value` over `duration` ms */
function useCountUp(value: number, duration: number = 800) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    cancelAnimationFrame(rafRef.current);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      if (elapsed >= duration) {
        setDisplayValue(value);
        return;
      }

      step = Math.floor((elapsed / duration) * steps);
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return displayValue;
}

// ─── Reusable Components (from annual-summary pattern) ───────────────────────

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

/** Returns colored badge + icon per action type */
function getActionBadge(action: string): { bg: string; text: string; icon: React.ReactNode; label: string } {
  const map: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    CREATE: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: "创建",
    },
    UPDATE: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      label: "更新",
    },
    ARCHIVE: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      label: "归档",
    },
    DELETE: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      label: "删除",
    },
    LOGIN: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
      label: "登录",
    },
  };

  const found = map[action];
  if (found) return found;

  return {
    bg: "bg-slate-100",
    text: "text-slate-600",
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: action,
  };
}

// ─── Stat Card Component ─────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle?: string;
  animationDelay?: number;
}

function StatCard({ title, value, icon, subtitle, animationDelay = 0 }: StatCardProps) {
  const animatedValue = useCountUp(value, 800);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden card-enter hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <div className="text-blue-600">{icon}</div>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-slate-600 truncate">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Card Body */}
      <div className="px-5 py-4">
        <div
          className="text-2xl font-bold text-slate-900 font-mono-custom"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {animatedValue}
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent" />
    </div>
  );
}

// ─── Section Card Wrapper ────────────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  titleEn?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  animationDelay?: number;
}

function SectionCard({ icon, title, titleEn, children, headerAction, animationDelay = 0 }: SectionCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden card-enter"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <div className="text-blue-600">{icon}</div>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 font-mono-custom tracking-tight">{title}</h2>
            {titleEn && <p className="text-xs text-slate-500">{titleEn}</p>}
          </div>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>

      {/* Section Content */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent" />
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiringLedgers, setExpiringLedgers] = useState<ExpiringLedger[]>([]);
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>(10);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      try {
        const statsRes = await fetch(`${apiUrl}/admin/dashboard/stats`, {
          credentials: "include",
        });
        const statsData = await statsRes.json();

        const now = new Date();
        const thisMonthNew = statsData.overview?.active || 0;

        setStats({
          overview: statsData.overview || {
            total: 0,
            active: 0,
            archived: 0,
            expiring_7d: 0,
            expiring_30d: 0,
          },
          this_month_new: thisMonthNew,
          low_stock_count: 0,
        });

        const today = new Date();
        const filterDate = new Date(today);
        filterDate.setDate(filterDate.getDate() + expiryFilter);

        const ledgersRes = await adminLedgerApi.list({
          status: "active",
          page: 1,
          page_size: 100,
        });

        const allLedgers = ledgersRes.data?.items ?? [];
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
            return {
              id: ledger.id,
              product_name: ledger.product_name,
              category: { level2: ledger.category?.level2 || '' },
              effective_expiry_date: ledger.effective_expiry_date,
              days_remaining: daysRemaining,
              quantity: ledger.quantity,
            };
          })
          .sort((a, b) =>
            a.days_remaining - b.days_remaining
          )
          .slice(0, 10);

        setExpiringLedgers(expiring);

        const auditRes = await auditLogApi.list({ page_size: 10 });
        setRecentActivity(Array.isArray(auditRes.data) ? auditRes.data : (auditRes.data?.items ?? []));
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
        .font-body-custom { font-family: 'IBM Plex Sans', sans-serif; }
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-enter { animation: cardEnter 0.5s ease-out forwards; opacity: 0; }
      `}</style>

      <div className="min-h-screen bg-[#FAFBFC] font-body-custom">
        <div className="space-y-6">

          {/* ── 1. Header Redesign ── */}
          <div className="flex items-center justify-between mb-8 header-slide">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 font-mono-custom tracking-tight">
                仪表板
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent rounded"></span>
                <span className="text-xs text-slate-500 font-mono-custom">DASHBOARD</span>
              </div>
            </div>
          </div>

          {/* ── 2. Stat Overview Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              title="台账总数"
              value={stats?.overview.total || 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              subtitle="总记录数"
              animationDelay={0.1}
            />
            <StatCard
              title="本月新增"
              value={stats?.this_month_new || 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              subtitle="活跃状态"
              animationDelay={0.15}
            />
            <StatCard
              title="已归档"
              value={stats?.overview.archived || 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              }
              subtitle="历史记录"
              animationDelay={0.2}
            />
            <StatCard
              title="即将到期"
              value={stats?.overview.expiring_7d || 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              subtitle="7天内"
              animationDelay={0.25}
            />
            <StatCard
              title="库存不足"
              value={stats?.low_stock_count || 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              subtitle="需补货"
              animationDelay={0.3}
            />
          </div>

          {/* ── 3. Two-Column Section ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Expiry Alerts Card */}
            <SectionCard
              title="到期提醒"
              titleEn="Expiry Alerts"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              headerAction={
                <div className="flex gap-2">
                  {([10, 20, 30] as ExpiryFilter[]).map((days) => (
                    <button
                      key={days}
                      onClick={() => setExpiryFilter(days)}
                      className={clsx(
                        "px-3 py-1 text-sm rounded-lg transition-all duration-200 font-mono-custom",
                        expiryFilter === days
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {days}天
                    </button>
                  ))}
                </div>
              }
              animationDelay={0.35}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-mono-custom">试剂</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-mono-custom">品类</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-mono-custom">到期日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-mono-custom">剩余</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-mono-custom">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expiringLedgers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                          暂无到期提醒
                        </td>
                      </tr>
                    ) : (
                      expiringLedgers.map((ledger) => (
                        <tr key={ledger.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                            {ledger.product_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {ledger.category?.level2 || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 font-mono-custom">
                            {format(new Date(ledger.effective_expiry_date), "yyyy-MM-dd")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={clsx(
                                  "w-2 h-2 rounded-full",
                                  ledger.days_remaining <= 7
                                    ? "bg-red-500 animate-pulse"
                                    : ledger.days_remaining <= 30
                                    ? "bg-orange-500"
                                    : "bg-yellow-500"
                                )}
                              />
                              <span
                                className={clsx(
                                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono-custom",
                                  ledger.days_remaining <= 7
                                    ? "bg-red-100 text-red-800"
                                    : ledger.days_remaining <= 30
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-yellow-100 text-yellow-800"
                                )}
                              >
                                {ledger.days_remaining}天
                              </span>
                            </div>
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
            </SectionCard>

            {/* Activity Timeline Card */}
            <SectionCard
              title="最近操作"
              titleEn="Recent Activity"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              animationDelay={0.4}
            >
              <div className="p-4 max-h-[400px] overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">暂无操作记录</p>
                ) : (
                  <div className="relative">
                    {/* Blue gradient timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-blue-400 to-slate-300" />
                    <div className="space-y-4">
                      {recentActivity.map((log, index) => {
                        const badge = getActionBadge(log.action);
                        return (
                          <div key={log.id} className="relative pl-8">
                            {/* Timeline dot — first item has pulsing blue ring */}
                            {index === 0 ? (
                              <div className="absolute left-3 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100 animate-pulse" />
                            ) : (
                              <div className="absolute left-3 top-1.5 w-2 h-2 rounded-full bg-slate-300 ring-2 ring-white" />
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Action badge */}
                                <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", badge.bg, badge.text)}>
                                  {badge.icon}
                                  {badge.label}
                                </span>
                                <span className="text-xs text-slate-400 font-mono-custom" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                  {log.target_id.slice(0, 8)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                {log.user?.username || "系统"} • {format(new Date(log.created_at), "MM-dd HH:mm")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}