"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import clsx from "clsx";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminContactApi } from "@/lib/api-client";

const categoryLabels: Record<string, string> = {
  support: "QC Support",
  technical: "Technical Issue",
  feature: "Feature Request",
  business: "Business Inquiry",
  other: "Other",
};

export default function AdminContactDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [replyContent, setReplyContent] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: submission, isLoading } = useQuery({
    queryKey: ["admin-contact", id],
    queryFn: () => adminContactApi.get(id).then((r) => r.data),
    enabled: !!id,
  });

  const replyMutation = useMutation({
    mutationFn: (content: string) => adminContactApi.reply(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-contact"] });
      queryClient.invalidateQueries({ queryKey: ["admin-contact-all"] });
      setReplyContent("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!submission) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-slate-600 font-medium">联系记录不存在</p>
          <Link href="/admin/contact" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            ← 返回联系列表
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/admin/contact"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回联系列表
        </Link>

        {/* Original Message Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-orange-500" />
            <h2 className="text-sm font-semibold text-slate-700">原始信息</h2>
            {submission.is_read ? (
              <span className="ml-auto text-xs text-slate-400">已读</span>
            ) : (
              <span className="ml-auto text-xs text-blue-600 font-medium">未读</span>
            )}
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-xs text-slate-500">姓名</span>
                  <p className="font-medium text-slate-900">{submission.name}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">邮箱</span>
                  <p className="text-slate-700">{submission.email}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">分类</span>
                  <p className="text-slate-700">{categoryLabels[submission.category] || submission.category}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">提交时间</span>
                  <p className="text-slate-700">{format(new Date(submission.created_at), "yyyy-MM-dd HH:mm:ss")}</p>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500">主题</span>
              <p className="font-semibold text-slate-900">{submission.subject}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">内容</span>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-4">
                {submission.message}
              </p>
            </div>
          </div>
        </div>

        {/* Reply History Timeline */}
        {submission.replies && submission.replies.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-teal-500" />
              <h2 className="text-sm font-semibold text-slate-700">回复历史</h2>
            </div>
            <div className="p-5">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-4">
                  {submission.replies.map((reply: { id: string; content: string; created_at: string; admin?: { username: string } }, index: number) => (
                    <div key={reply.id} className="relative flex items-start gap-4 pl-10">
                      <div className={clsx(
                        "absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 bg-white z-10",
                        index === 0 ? "border-teal-500 ring-2 ring-teal-100" : "border-slate-300"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium text-teal-600">
                            {reply.admin?.username || "Admin"}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-400">
                            {format(new Date(reply.created_at), "yyyy-MM-dd HH:mm:ss")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reply Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-blue-500" />
            <h2 className="text-sm font-semibold text-slate-700">发送回复</h2>
          </div>
          <div className="p-5 space-y-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="输入回复内容..."
              rows={5}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex items-center justify-between">
              {showSuccess && (
                <span className="text-sm text-teal-600 font-medium">回复已发送！</span>
              )}
              <button
                onClick={() => replyContent.trim() && replyMutation.mutate(replyContent)}
                disabled={!replyContent.trim() || replyMutation.isPending}
                className="ml-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replyMutation.isPending ? "发送中..." : "发送回复"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}