"use client";

import { useTranslations } from "next-intl";

interface SearchCreateBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  isLoggedIn?: boolean;
  onProtectedAction?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export function SearchCreateBar({
  searchValue,
  onSearchChange,
  isLoggedIn = false,
  onProtectedAction,
  rightContent,
  className = "",
}: SearchCreateBarProps) {
  const t = useTranslations("ledger");
  const tFilter = useTranslations("ledger.filter");

  return (
    <div className={`flex gap-3 ${className}`}>
      {/* Search Input */}
      <div className="flex-1 relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
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
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {rightContent}

      {/* Create Button */}
      <button
        onClick={() => {
          if (!isLoggedIn) {
            onProtectedAction?.();
            return;
          }
          window.location.href = "/ledger/create";
        }}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
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
      </button>
    </div>
  );
}
