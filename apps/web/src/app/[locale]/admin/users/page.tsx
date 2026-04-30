"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";

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

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
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
    <Modal open={open} onClose={onClose} title={initial ? "编辑用户" : "新建用户"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            用户名 *
          </label>
          <input
            required
            type="text"
            value={form.username}
            onChange={(e) => set("username", e.target.value)}
            disabled={!!initial}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            邮箱 *
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            电话
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            部门
          </label>
          <input
            type="text"
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            角色
          </label>
          <select
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        {!initial && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              初始密码
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="留空则使用随机密码"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "处理中..." : "确认"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50"
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

  return (
    <Modal open={open} onClose={onClose} title={`重置密码 - ${user?.username}`}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          请输入新密码。密码将立即生效，用户需要使用新密码登录。
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            新密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入新密码"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onSubmit(password)}
            disabled={isPending || !password}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "重置中..." : "确认重置"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50"
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
    <Modal open={open} onClose={onClose} title="删除用户">
      <div className="space-y-4">
        {isSelf ? (
          <p className="text-red-600 font-medium">不能删除当前登录用户</p>
        ) : (
          <p className="text-slate-700">
            确定要删除用户 <strong>{user?.username}</strong> 吗？此操作不可撤销。
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onConfirm}
            disabled={isPending || isSelf}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "删除中..." : "确认删除"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50"
          >
            取消
          </button>
        </div>
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

  return (
    <Modal open={open} onClose={onClose} title="批量导入用户">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          支持 .xlsx 或 .csv 文件，格式：用户名, 邮箱, 电话, 部门, 角色（留空默认user）
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.csv"
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              if (fileRef.current?.files?.[0]) onImport(fileRef.current.files[0]);
            }}
            disabled={isPending || !fileRef.current?.files?.[0]}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "导入中..." : "开始导入"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50"
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
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<User | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<User | undefined>();
  const [resetPasswordTarget, setResetPasswordTarget] = useState<User | undefined>();
  const [showImport, setShowImport] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      return fetch(
        `${apiUrl}/admin/users/?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`,
        { credentials: "include" }
      ).then((r) => r.json());
    },
  });

  const users: User[] = Array.isArray(data) ? data : [];
  const totalPages = Math.ceil(users.length / pageSize) || 1;

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
          <div className="ml-auto flex gap-3">
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              批量导入
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              新建用户
            </button>
          </div>
        </div>

        {/* Action message */}
        {actionMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">
            {actionMsg}
          </div>
        )}

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索用户名、邮箱或部门..."
            className="flex-1 max-w-md border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            搜索
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium"
            >
              清除
            </button>
          )}
        </form>

        {/* Users table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">加载中...</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      用户名
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      邮箱
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      部门
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      角色
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      最后登录
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      创建时间
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        暂无用户数据
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {u.username}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{u.email}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {u.department || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {u.role === "admin" ? "管理员" : "用户"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {u.last_login_at
                            ? format(new Date(u.last_login_at), "yyyy-MM-dd HH:mm")
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {u.created_at
                            ? format(new Date(u.created_at), "yyyy-MM-dd")
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => setEditTarget(u)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => setResetPasswordTarget(u)}
                              className="text-orange-600 hover:text-orange-800 text-xs font-medium"
                            >
                              重置密码
                            </button>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {users.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    第 {page} 页
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={users.length < pageSize}
                      className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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
