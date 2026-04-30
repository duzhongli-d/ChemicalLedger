"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import clsx from "clsx";

const navItems = [
  {
    key: "ledgers",
    href: "/ledgers",
    icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
    labelKey: "aiAssistant",
  },
  {
    key: "research",
    href: "/research",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    labelKey: "deepResearch",
  },
  {
    key: "notifications",
    href: "/notifications",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    labelKey: "notifications",
  },
];

interface LedgerSidebarProps {
  className?: string;
}

export function LedgerSidebar({ className = "" }: LedgerSidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside
      className={clsx(
        "relative flex flex-col bg-[#0f172a] border-r border-white/10 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <BrandLogo className="w-10 h-10 flex-shrink-0" />
        {!collapsed && (
          <span className="text-lg font-semibold text-white tracking-tight">
            {t("brand")}
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative",
                active
                  ? "text-[#14b8a6] bg-[#14b8a6]/10 border-r-2 border-[#14b8a6]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#0f172a] border border-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-white/40 transition-colors"
      >
        <svg
          className={clsx("w-3 h-3 transition-transform", collapsed ? "rotate-180" : "")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/10">
        {!collapsed ? (
          <div className="text-xs text-slate-500">
            <p>{t("brand")}</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto">
            <BrandLogo className="w-8 h-8" />
          </div>
        )}
      </div>
    </aside>
  );
}
