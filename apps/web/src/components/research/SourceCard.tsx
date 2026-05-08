"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ResearchSource } from "@/lib/api-client";

const typeConfig: Record<
  ResearchSource["source_type"],
  { icon: string; color: string; bgColor: string }
> = {
  PDF: { icon: "📄", color: "text-red-600", bgColor: "bg-red-50" },
  URL: { icon: "🔗", color: "text-green-600", bgColor: "bg-green-50" },
  TEXT: { icon: "📝", color: "text-blue-600", bgColor: "bg-blue-50" },
  VIDEO: { icon: "🎬", color: "text-purple-600", bgColor: "bg-purple-50" },
  AUDIO: { icon: "🎧", color: "text-amber-600", bgColor: "bg-amber-50" },
};

const statusConfig: Record<
  ResearchSource["status"],
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "pending",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  PROCESSING: {
    label: "processing",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  READY: {
    label: "ready",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  ERROR: {
    label: "error",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface SourceCardProps {
  source: ResearchSource;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function SourceCard({ source, onDelete, isDeleting }: SourceCardProps) {
  const t = useTranslations("research");
  const [showCopied, setShowCopied] = useState(false);

  const type = typeConfig[source.source_type];
  const status = statusConfig[source.status];
  const fileName = source.file_name || source.file_url || "Untitled";
  const previewSnippet =
    source.source_type === "TEXT" && source.extra_data?.preview_snippet
      ? (source.extra_data.preview_snippet as string)
      : null;
  const pageCount =
    source.source_type === "PDF" && source.extra_data?.page_count
      ? (source.extra_data.page_count as number)
      : null;

  const handleCopyUrl = async () => {
    if (source.file_url) {
      await navigator.clipboard.writeText(source.file_url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className="group relative flex flex-col p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-md transition-all duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-lg ${type.bgColor} rounded-lg p-1.5`}
            title={source.source_type}
          >
            {type.icon}
          </span>
          <div className="min-w-0">
            <p
              className="text-sm font-medium text-gray-900 truncate font-mono"
              title={fileName}
            >
              {fileName}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(source.file_size)}
              {pageCount !== null && ` • ${pageCount} pages`}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${status.color} ${status.bgColor}`}
        >
          {t(`status.${status.label}`)}
        </span>
      </div>

      {/* Date */}
      <p className="text-xs text-gray-400 mb-2">{formatDate(source.created_at)}</p>

      {/* Preview snippet for TEXT sources */}
      {previewSnippet && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2 italic">
          {previewSnippet.slice(0, 100)}
          {previewSnippet.length > 100 && "..."}
        </p>
      )}

      {/* Hover actions */}
      <div className="flex items-center gap-1 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {source.file_url && (
          <button
            onClick={handleCopyUrl}
            className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            title={showCopied ? t("copied") || "Copied!" : t("copyUrl") || "Copy URL"}
          >
            {showCopied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("copied") || "Copied!"}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{t("copyUrl") || "Copy URL"}</span>
              </>
            )}
          </button>
        )}
        <button
          onClick={() => onDelete(source.id)}
          disabled={isDeleting}
          className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          title={t("delete")}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>{t("delete")}</span>
        </button>
      </div>
    </div>
  );
}
