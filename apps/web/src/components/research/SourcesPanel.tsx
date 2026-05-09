"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { researchApi } from "@/lib/api-client";
import { useState } from "react";
import { SourceUploadModal } from "./SourceUploadModal";
import { SourceCard } from "./SourceCard";

export function SourcesPanel({ notebookId }: { notebookId: string }) {
  const t = useTranslations("research");
  const queryClient = useQueryClient();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ["sources", notebookId],
    queryFn: () => researchApi.listSources(notebookId).then((r) => r.data),
    enabled: !!notebookId,
  });

  const deleteMutation = useMutation({
    mutationFn: (sourceId: string) => researchApi.deleteSource(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", notebookId] });
      setDeleteConfirm(null);
    },
  });

  // Group sources by type for type headers
  const groupedSources = sources.reduce((acc, source) => {
    const type = source.source_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(source);
    return acc;
  }, {} as Record<string, typeof sources>);

  const typeOrder = ["PDF", "URL", "TEXT", "VIDEO", "AUDIO"];

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 shadow-sm hover:border-orange-400/50 hover:shadow-lg transition-all duration-300 p-4">
      <div className="flex items-center justify-between mb-4">
        {/* Title provided by parent page.tsx */}
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {t("addSource")}
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : sources.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-sm text-gray-500 mb-2">{t("common.noSources")}</p>
          <p className="text-xs text-gray-400">{t("common.addFirstSource") || "点击上方按钮添加第一个来源"}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
          {typeOrder.map((type) => {
            const items = groupedSources[type];
            if (!items || items.length === 0) return null;
            return (
              <div key={type}>
                <div className="text-xs font-mono font-semibold text-gray-500 mb-2 flex items-center gap-1">
                  <span>{type === "PDF" ? "📄" : type === "URL" ? "🔗" : type === "TEXT" ? "📝" : type === "VIDEO" ? "🎬" : "🎧"}</span>
                  <span>{type}</span>
                  <span className="ml-1 bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full text-[10px]">{items.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((source, idx) => (
                    <div
                      key={source.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <SourceCard
                        source={source}
                        onDelete={(id) => setDeleteConfirm(id)}
                        isDeleting={deleteConfirm === source.id && deleteMutation.isPending}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-lg">⚠️</span>
              </div>
              <h4 className="font-bold font-mono text-gray-900">{t("confirmDelete")}</h4>
            </div>
            <p className="text-sm text-gray-500 mb-6">{t("confirmDeleteSource")}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
              >
                {deleteMutation.isPending ? t("common.loading") : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      <SourceUploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["sources", notebookId] });
        }}
        notebookId={notebookId}
      />
    </div>
  );
}