"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";

interface LedgersTopBarProps {
  isLoggedIn: boolean;
  username?: string;
  onLoginClick: () => void;
  onLogout: () => void;
}

export function LedgersTopBar({ isLoggedIn, username, onLoginClick, onLogout }: LedgersTopBarProps) {
  const t = useTranslations("common");
  const pathname = usePathname();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-teal-600">QC</span>
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">
          台账列表
        </h1>
      </div>

      {/* Right: Language + Auth */}
      <div className="flex items-center gap-4">
        {/* Language Switch */}
        <div className="flex items-center gap-1">
          <Link
            href={pathname}
            locale="zh"
            className={clsx(
              "px-2 py-1 text-sm rounded",
              "text-slate-600 hover:bg-slate-100"
            )}
          >
            中文
          </Link>
          <Link
            href={pathname}
            locale="en"
            className={clsx(
              "px-2 py-1 text-sm rounded",
              "text-slate-600 hover:bg-slate-100"
            )}
          >
            EN
          </Link>
        </div>

        {/* Auth Section */}
        {isLoggedIn ? (
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-medium">
                {username?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm text-slate-700">{username}</span>
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                登出
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
              "bg-teal-500 text-white hover:bg-teal-600"
            )}
          >
            登录
          </button>
        )}
      </div>
    </header>
  );
}
