"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Link } from "@/i18n/navigation";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const { isAdmin } = useAuthStore();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => userApi.list().then((r) => r.data),
    enabled: isAdmin(),
  });

  if (!isAdmin()) {
    return <div className="text-center py-12 text-red-500">需要管理员权限</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600">← {t("users")}</Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("users")}</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["用户名", "邮箱", "角色", "部门", "创建时间"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u: { id: string; username: string; email: string; role: string; department?: string; created_at: string }) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {u.role === "admin" ? "管理员" : "用户"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.department || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{u.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
