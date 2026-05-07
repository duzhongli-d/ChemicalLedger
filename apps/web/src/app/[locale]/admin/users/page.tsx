"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import clsx from "clsx";

type User = {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  created_at: string;
  last_login_at?: string;
};

type UserForm = {
  username: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  password?: string;
};

const defaultForm: UserForm = {
  username: "",
  email: "",
  phone: "",
  department: "",
  role: "user",
  password: "",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium font-mono-custom",
        role === "admin"
          ? "bg-purple-500/15 text-purple-600"
          : "bg-blue-500/15 text-blue-600"
      )}
    >
      {role === "admin" ? (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ) : (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )}
      {role === "admin" ? "管理员" : "用户"}
    </span>
  );
}

function UserCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-3 bg-slate-200 rounded w-40" />
        </div>
        <div className="h-6 bg-slate-200 rounded w-16" />
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center card-enter">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">暂无用户</h3>
      <p className="text-sm text-slate-500 mb-4">创建第一个用户开始管理您的团队</p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium font-mono-custom transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        新建用户
      </button>
    </div>
  );
}

function UserCard({
  user,
  isCurrentUser,
  onEdit,
  onResetPassword,
  onDelete,
  index,
}: {
  user: User;
  isCurrentUser: boolean;
  onEdit: () => void;
  onResetPassword: () => void;
  onDelete: () => void;
  index: number;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden card-enter hover:border-slate-300 hover:shadow-sm transition-all group"
      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-semibold text-blue-600 font-mono-custom">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-slate-900 font-mono-custom truncate">
                {user.username}
              </h3>
              {isCurrentUser && (
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded font-mono-custom">
                  当前
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 font-mono-custom truncate mb-2">{user.email}</p>
            <div className="flex items-center gap-3">
              <RoleBadge role={user.role} />
              {user.department && (
                <span className="text-xs text-slate-400 font-mono-custom flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {user.department}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
              title="编辑"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onResetPassword}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-600 transition-all"
              title="重置密码"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              disabled={isCurrentUser}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="删除"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono-custom">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            创建于 {user.created_at ? format(new Date(user.created_at), "yyyy-MM-dd") : "-"}
          </div>
          {user.last_login_at && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono-custom">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              最近登录 {format(new Date(user.last_login_at), "MM-dd HH:mm")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl mx-4 overflow-hidden modal-animate shadow-xl border border-slate-200">
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-slate-100">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent"></div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 font-mono-custom">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 font-mono-custom">{subtitle}</p>}
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
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function UserFormModal({
  open,
  onClose,
  initial,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  initial?: User;
  onSubmit: (data: UserForm) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<UserForm>(
    initial
      ? {
          username: initial.username,
          email: initial.email,
          phone: initial.phone || "",
          department: initial.department || "",
          role: initial.role,
          password: "",
        }
      : defaultForm
  );

  const set = (key: keyof UserForm, value: string) =>
    setForm({ ...form, [key]: value });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "编辑用户" : "新建用户"}
      subtitle="用户管理"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">
              用户名 *
            </label>
            <input
              required
              type="text"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              disabled={!!initial}
              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-slate-100 disabled:text-slate-500 font-mono-custom"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">
              部门
            </label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono-custom"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">
            邮箱 *
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono-custom"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">
              电话
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono-custom"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">
              角色
            </label>
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono-custom cursor-pointer"
            >
              <option value="user">用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>

        {!initial && (
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">
              初始密码
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="留空则使用随机密码"
              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono-custom"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium font-mono-custom hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                处理中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                确认
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-all font-mono-custom"
          >
            取消
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({
  open,
  onClose,
  user,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  user?: User;
  onSubmit: (password: string) => void;
  isPending: boolean;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="重置密码"
      subtitle={user?.username}
    >
      <div className="space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-800">
            密码重置后将立即生效，用户需要使用新密码重新登录。
          </p>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1.5 font-mono-custom">
            新密码
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入新密码"
              className="w-full bg-white border border-slate-200 px-3 py-2.5 pr-10 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono-custom"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onSubmit(password)}
            disabled={isPending || !password}
            className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg font-medium font-mono-custom hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                重置中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                确认重置
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-all font-mono-custom"
          >
            取消
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteModal({
  open,
  onClose,
  user,
  currentUserId,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  user?: User;
  currentUserId?: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const isSelf = user?.id === currentUserId;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="删除用户"
      subtitle="用户管理"
    >
      <div className="space-y-5">
        {isSelf ? (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">
              不能删除当前登录用户
            </p>
          </div>
        ) : (
          <>
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-800">
                确定要删除用户 <strong className="font-mono-custom">{user?.username}</strong> 吗？此操作不可撤销。
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onConfirm}
                disabled={isPending}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium font-mono-custom hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    删除中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    确认删除
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-all font-mono-custom"
              >
                取消
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function ImportModal({
  open,
  onClose,
  onImport,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  isPending: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  const downloadTemplate = () => {
    const headers = ["username", "email", "phone", "department", "role"];
    const sampleRow = ["示例用户名", "example@company.com", "13800138000", "技术部", "user"];
    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `用户导入模板_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="批量导入用户"
      subtitle="用户管理"
    >
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">支持格式</p>
            <p className="text-blue-700">.xlsx 或 .csv 文件，格式：用户名, 邮箱, 电话, 部门, 角色（留空默认user）</p>
          </div>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".csv"))) {
              setFileName(file.name);
              if (fileRef.current) fileRef.current.files = e.dataTransfer.files;
            }
          }}
          className={clsx(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
            fileName
              ? "border-blue-400 bg-blue-50"
              : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFileName(file.name);
            }}
          />
          {fileName ? (
            <>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-900 font-mono-custom">{fileName}</p>
              <p className="text-xs text-slate-500 mt-1">点击重新选择</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm text-slate-600">拖放文件到此处，或点击选择文件</p>
              <p className="text-xs text-slate-400 mt-1">支持 .xlsx, .csv</p>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <div className="flex gap-2">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-mono-custom"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载模板
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-mono-custom"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              批量导入
            </button>
          </div>
          <button
            onClick={() => {
              if (fileRef.current?.files?.[0]) onImport(fileRef.current.files[0]);
            }}
            disabled={isPending || !fileName}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium font-mono-custom hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                导入中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                开始导入
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="border border-slate-200 text-slate-600 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-all font-mono-custom px-4"
          >
            取消
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<User | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<User | undefined>();
  const [resetPasswordTarget, setResetPasswordTarget] = useState<User | undefined>();
  const [showImport, setShowImport] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const pageSize = 12;

  useEffect(() => { setMounted(true); }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter],
    queryFn: () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        search: search || "",
      });
      if (roleFilter !== "all") params.set("role", roleFilter);
      return fetch(
        `${apiUrl}/admin/users/?${params.toString()}`,
        { credentials: "include" }
      ).then((r) => r.json());
    },
  });

  const users: User[] = Array.isArray(data) ? data : (data?.data ?? []);
  const totalPages = Math.ceil((data?.total ?? users.length) / pageSize) || 1;

  const createMutation = useMutation({
    mutationFn: (data: UserForm) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/users/`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      ).then((r) => {
        if (!r.ok) throw new Error("创建失败");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowCreate(false);
      setActionMsg("用户创建成功");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: (err: Error) => setActionMsg(err.message || "创建失败"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserForm> }) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/users/${id}`,
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
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditTarget(undefined);
      setActionMsg("用户更新成功");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: (err: Error) => setActionMsg(err.message || "更新失败"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/users/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      ).then((r) => {
        if (!r.ok) throw new Error("删除失败");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteTarget(undefined);
      setActionMsg("用户已删除");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: (err: Error) => setActionMsg(err.message || "删除失败"),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/users/${id}/reset-password`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_password: password }),
        }
      ).then((r) => {
        if (!r.ok) throw new Error("密码重置失败");
        return r.json();
      }),
    onSuccess: () => {
      setResetPasswordTarget(undefined);
      setActionMsg("密码重置成功");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: (err: Error) => setActionMsg(err.message || "密码重置失败"),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/users/import`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      ).then((r) => {
        if (!r.ok) throw new Error("导入失败");
        return r.json();
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowImport(false);
      setActionMsg(`导入完成：成功 ${data.success_count}，跳过 ${data.skip_count}`);
      setTimeout(() => setActionMsg(""), 5000);
    },
    onError: () => setActionMsg("导入失败"),
  });

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
        .font-body-custom { font-family: 'IBM Plex Sans', sans-serif; }
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes headerSlideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .card-enter { animation: cardEnter 0.45s ease-out forwards; opacity: 0; }
        .header-slide { animation: headerSlideIn 0.4s ease-out forwards; }
        .modal-overlay {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-animate { animation: modalSlideUp 0.3s ease-out forwards; }
      `}</style>

      <div className="min-h-screen bg-background font-body-custom">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 header-slide">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 font-mono-custom tracking-tight">
                用户管理
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent rounded"></span>
                <span className="text-xs text-slate-500 font-mono-custom">USER MANAGEMENT</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImport(true)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium font-mono-custom transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                批量导入
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium font-mono-custom transition-all flex items-center gap-2 shadow-sm shadow-blue-600/30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新建用户
              </button>
            </div>
          </div>

          {/* Action message */}
          {actionMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 card-enter">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {actionMsg}
            </div>
          )}

          {/* Search bar */}
          <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 card-enter">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索用户名、邮箱或部门..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono-custom"
              />
            </div>

            {/* Role Tabs */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(["all", "admin", "user"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setRoleFilter(tab); setPage(1); }}
                  className={clsx(
                    "px-4 py-2 text-sm font-medium transition-colors font-mono-custom",
                    roleFilter === tab
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {tab === "all" ? "全部" : tab === "admin" ? "管理员" : "用户"}
                </button>
              ))}
            </div>
          </div>

          {/* User cards grid */}
          <div className="card-enter" style={{ animationDelay: "0.15s" }}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <EmptyState onAdd={() => setShowCreate(true)} />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user, index) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      isCurrentUser={user.id === currentUser?.id}
                      onEdit={() => setEditTarget(user)}
                      onResetPassword={() => setResetPasswordTarget(user)}
                      onDelete={() => setDeleteTarget(user)}
                      index={index}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {users.length > 0 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-slate-500 font-mono-custom">
                      共 {data?.total ?? users.length} 用户
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-mono-custom transition-all bg-white"
                      >
                        <svg className="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        上一页
                      </button>
                      <div className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-mono-custom text-slate-700">
                        第 {page} / {totalPages || 1} 页
                      </div>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={users.length < pageSize}
                        className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-mono-custom transition-all bg-white"
                      >
                        下一页
                        <svg className="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />

      <UserFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(undefined)}
        initial={editTarget}
        onSubmit={(data) =>
          editTarget && updateMutation.mutate({ id: editTarget.id, data })
        }
        isPending={updateMutation.isPending}
      />

      <ResetPasswordModal
        open={!!resetPasswordTarget}
        onClose={() => setResetPasswordTarget(undefined)}
        user={resetPasswordTarget}
        onSubmit={(password) =>
          resetPasswordTarget &&
          resetPasswordMutation.mutate({ id: resetPasswordTarget.id, password })
        }
        isPending={resetPasswordMutation.isPending}
      />

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        user={deleteTarget}
        currentUserId={currentUser?.id}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isPending={deleteMutation.isPending}
      />

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={(file) => importMutation.mutate(file)}
        isPending={importMutation.isPending}
      />
    </AdminLayout>
  );
}
