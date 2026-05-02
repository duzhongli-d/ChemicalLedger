"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface SearchCreateBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  className?: string;
}

export function SearchCreateBar({
  searchValue,
  onSearchChange,
  className = "",
}: SearchCreateBarProps) {
  const t = useTranslations("ledger");
  const tFilter = useTranslations("ledger.filter");

  return (
    <div className={`flex gap-3 ${className}`}>
      {/* Search Input */}
      <div className="flex-1 relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder={tFilter("search")}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all"
        />
      </div>

      {/* Create Button */}
      <Link
        href="/ledger/create"
        className="inline-flex items-center gap-2 bg-[#f97316] text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-[#ea580c] transition-colors shadow-lg shadow-orange-500/25"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {t("create")}
      </Link>
    </div>
  );
}
