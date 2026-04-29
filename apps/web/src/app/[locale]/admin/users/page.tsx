"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { Link } from "@/i18n/navigation";
import { useState, useRef } from "react";

type User = {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  created_at: string;
};

type UserForm = {
  username: string;
  email: string;
  phone: string;
  department: string;
  role: string;
};

const defaultForm: UserForm = { username: "", email: "", phone: "", department: "", role: "user" };

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function UserFormModal({ open, onClose, initial, onSubmit, isPending }: {
  open: boolean; onClose: () => void; initial?: User; onSubmit: (data: UserForm) => void; isPending: boolean;
}) {
  const [form, setForm] = useState<UserForm>(initial
    ? { username: initial.username, email: initial.email, phone: initial.phone || "", department: initial.department || "", role: initial.role }
    : defaultForm
  );

  const set = (key: keyof UserForm, value: string) => setForm({ ...form, [key]: value });

  return (
    <Modal open={open} onClose={onClose} title={initial ? "编辑用户" : "新建用户"}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">用户名 *</label>
          <input required type="text" value={form.username} onChange={(e) => set("username", e.target.value)}
            disabled={!!initial}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
          <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
          <input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
          <input type="text" value={form.department} onChange={(e) => set("department", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
          <select value={form.role} onChange={(e) => set("role", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
            <option value="user">用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isPending}
            className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50">
            {isPending ? "处理中..." : "确认"}
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50">
            取消
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({ open, onClose, user, onConfirm, isPending }: {
  open: boolean; onClose: () => void; user?: User; onConfirm: () => void; isPending: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="删除用户">
      <div className="space-y-4">
        <p className="text-gray-700">确定要删除用户 <strong>{user?.username}</strong> 吗？此操作不可撤销。</p>
        <div className="flex gap-3 pt-2">
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">
            {isPending ? "删除中..." : "确认删除"}
          </button>
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50">
            取消
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ImportModal({ open, onClose, onImport, isPending }: {
  open: boolean; onClose: () => void; onImport: (file: File) => void; isPending: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Modal open={open} onClose={onClose} title="批量导入用户">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">支持 .xlsx 或 .csv 文件，格式：用户名, 邮箱, 电话, 部门, 角色（留空默认user）</p>
        <input ref={fileRef} type="file" accept=".xlsx,.csv"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        <div className="flex gap-3 pt-2">
          <button onClick={() => { if (fileRef.current?.files?.[0]) onImport(fileRef.current.files[0]); }}
            disabled={isPending || !fileRef.current?.files?.[0]}
            className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50">
            {isPending ? "导入中..." : "开始导入"}
          </button>
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50">
            取消
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<User | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<User | undefined>();
  const [showImport, setShowImport] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => userApi.list().then((r) => r.data),
    enabled: isAdmin(),
  });

  const createMutation = useMutation({
    mutationFn: (data: UserForm) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/users/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => { if (!r.ok) throw new Error("创建失败"); return r.json(); }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowCreate(false);
      setActionMsg("用户创建成功");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: () => setActionMsg("创建失败"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserForm> }) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => { if (!r.ok) throw new Error("更新失败"); return r.json(); }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditTarget(undefined);
      setActionMsg("用户更新成功");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: () => setActionMsg("更新失败"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then((r) => { if (!r.ok) throw new Error("删除失败"); return r.json(); }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteTarget(undefined);
      setActionMsg("用户已删除");
      setTimeout(() => setActionMsg(""), 3000);
    },
    onError: () => setActionMsg("删除失败"),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/users/import`, {
        method: "POST",
        credentials: "include",
        body: formData,
      }).then((r) => { if (!r.ok) throw new Error("导入失败"); return r.json(); });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowImport(false);
      setActionMsg(`导入完成：成功 ${data.success_count}，跳过 ${data.skip_count}`);
      setTimeout(() => setActionMsg(""), 5000);
    },
    onError: () => setActionMsg("导入失败"),
  });

  if (!isAdmin()) {
    return <div className="text-center py-12 text-red-500">需要管理员权限</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600">← {t("users")}</Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("users")}</h1>
        <div className="ml-auto flex gap-3">
          <button onClick={() => setShowImport(true)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            批量导入
          </button>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium">
            新建用户
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">{actionMsg}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["用户名", "邮箱", "电话", "角色", "部门", "创建时间", "操作"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u: User) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {u.role === "admin" ? "管理员" : "用户"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.department || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{u.created_at?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditTarget(u)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium">编辑</button>
                      <button onClick={() => setDeleteTarget(u)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
        onSubmit={(data) => editTarget && updateMutation.mutate({ id: editTarget.id, data })}
        isPending={updateMutation.isPending}
      />

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        user={deleteTarget}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isPending={deleteMutation.isPending}
      />

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={(file) => importMutation.mutate(file)}
        isPending={importMutation.isPending}
      />
    </div>
  );
}
