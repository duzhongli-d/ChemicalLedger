"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import clsx from "clsx";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminContactApi, ContactSubmission } from "@/lib/api-client";
import { Pagination } from "@/components/layout/Pagination";

const PAGE_SIZE = 20;

const categoryLabels: Record<string, string> = {
  support: "QC Support",
  technical: "Technical Issue",
  feature: "Feature Request",
  business: "Business Inquiry",
  other: "Other",
};

export default function AdminContactPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: allData } = useQuery({
    queryKey: ["admin-contact-all"],
    queryFn: () => adminContactApi.list({ page_size: 500 }).then((r) => r.data),
  });

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["admin-contact", currentPage, activeTab, categoryFilter, searchQuery],
    queryFn: () => {
      let is_read: string | undefined;
      if (activeTab === "unread") is_read = "false";
      else if (activeTab === "read") is_read = "true";
      return adminContactApi.list({
        page: currentPage,
        page_size: PAGE_SIZE,
        is_read,
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
      }).then((r) => r.data);
    },
  });

  const submissions = paginatedData?.items ?? [];
  const totalItems = paginatedData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const tabCounts = useMemo(() => {
    const counts = { all: 0, unread: 0, read: 0 };
    (allData?.items ?? []).forEach((s: ContactSubmission) => {
      counts.all++;
      if (s.is_read) counts.read++;
      else counts.unread++;
    });
    return counts;
  }, [allData]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => adminContactApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-all"] });
      queryClient.invalidateQueries({ queryKey: ["admin-contact"] });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">联系管理</h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="搜索姓名、邮箱、主题、内容..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(["all", "unread", "read"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={clsx(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab === "all" ? "全部" : tab === "unread" ? "未读" : "已读"}
                <span className="ml-1 text-xs opacity-75">({tabCounts[tab]})</span>
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部分类</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">加载中...</div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">暂无数据</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className={clsx(
                    "p-4 hover:bg-slate-50 transition-colors",
                    !submission.is_read && "border-l-4 border-blue-500"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={clsx(
                          "inline-block px-2 py-0.5 rounded text-xs font-medium",
                          submission.is_read ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-700"
                        )}>
                          {submission.is_read ? "已读" : "未读"}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {categoryLabels[submission.category] || submission.category}
                        </span>
                      </div>
                      <Link
                        href={`/admin/contact/${submission.id}`}
                        className="block mt-1 text-base font-medium text-slate-900 hover:text-blue-600 truncate"
                      >
                        {submission.subject}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{submission.name}</span>
                        <span>·</span>
                        <span>{submission.email}</span>
                        <span>·</span>
                        <span>{format(new Date(submission.created_at), "yyyy-MM-dd HH:mm")}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{submission.message}</p>
                      {submission.replies && submission.replies.length > 0 && (
                        <p className="mt-1 text-xs text-teal-600">
                          {submission.replies.length} 条回复
                        </p>
                      )}
                    </div>
                    {!submission.is_read && (
                      <button
                        onClick={(e) => { e.preventDefault(); markReadMutation.mutate(submission.id); }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                      >
                        标记已读
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </AdminLayout>
  );
}