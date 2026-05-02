"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface LedgerHeaderProps {
  className?: string;
}

export function LedgerHeader({ className = "" }: LedgerHeaderProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <header className={`h-16 bg-[#f8fafc] border-b border-slate-200 px-6 flex items-center justify-between ${className}`}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-slate-500 hover:text-slate-700 transition-colors">
          {t("home")}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">{t("ledgers")}</span>
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {/* Orange dot indicator */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f97316] rounded-full" />
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white flex items-center justify-center text-sm font-medium shadow-lg shadow-orange-500/25">
            U
          </div>
        </button>
      </div>
    </header>
  );
}
