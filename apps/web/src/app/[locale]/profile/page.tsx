"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth-store";
import { researchApi } from "@/lib/api-client";
import clsx from "clsx";

export default function ProfilePage() {
  const t = useTranslations();
  const { user } = useAuthStore();

  const { data: quota } = useQuery({
    queryKey: ["quota"],
    queryFn: () => researchApi.getQuota().then((r) => r.data),
    enabled: !!user,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("nav.profile")}</h1>

      {/* User Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">账号信息</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">{t("auth.username")}</span>
            <span className="text-gray-900 font-medium">{user?.username}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">{t("auth.email")}</span>
            <span className="text-gray-900">{user?.email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">角色</span>
            <span className="text-gray-900">{user?.role === "admin" ? "管理员" : "普通用户"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">部门</span>
            <span className="text-gray-900">{user?.department || "-"}</span>
          </div>
        </div>
      </div>

      {/* Quota Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">深度调研配额</h2>
        {quota ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">今日可用次数</span>
              <span className={clsx(
                "text-2xl font-bold",
                quota.used_today >= quota.limit ? "text-red-600" : "text-blue-700"
              )}>
                {quota.limit - quota.used_today}
                <span className="text-sm font-normal text-gray-400"> / {quota.limit}</span>
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={clsx(
                  "h-2 rounded-full transition-all",
                  quota.used_today >= quota.limit ? "bg-red-500" : "bg-blue-600"
                )}
                style={{ width: `${Math.min((quota.used_today / quota.limit) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>已使用 {quota.used_today} 次</span>
              <span>学术空间 {quota.notebooks_count} / {quota.notebooks_limit}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">加载中...</p>
        )}
      </div>
    </div>
  );
}