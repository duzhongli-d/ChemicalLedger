"use client";

import clsx from "clsx";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={clsx("flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
      {/* Left: Showing X-Y of Z */}
      <div className="text-sm text-slate-500">
        <span>显示 </span>
        <span className="font-medium text-slate-700">{startItem}-{endItem}</span>
        <span> 共 </span>
        <span className="font-medium text-slate-700">{totalItems}</span>
        <span> 条</span>
      </div>

      {/* Right: Page Numbers */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            currentPage === 1
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, idx) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={clsx(
                "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                currentPage === page
                  ? "bg-[#f97316] text-white"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            currentPage === totalPages
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
