"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { LanguageToggle } from "./LanguageToggle";
import { MobileMenu } from "./MobileMenu";
import { useTheme } from "@/components/providers";
import clsx from "clsx";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isAdmin } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: "/ledgers", label: t("ledgers") },
    ...(isAuthenticated() ? [
      { href: "/notifications", label: t("notifications") || "通知" },
      { href: "/research", label: t("research") },
    ] : []),
    ...(isAdmin() ? [{ href: "/admin/users", label: t("admin") }] : []),
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-700 dark:text-blue-400">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="currentColor" />
              <path d="M8 16h16M16 8v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            雅本化学 QC
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 pb-1"
                    : "text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-600"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <LanguageToggle />
            <MobileMenu />

            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400"
                >
                  <span className="w-8 h-8 rounded-full bg-blue-700 dark:bg-blue-600 text-white flex items-center justify-center font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden md:inline">{user?.username}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{user?.role === "admin" ? "管理员" : "用户"}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t("profile")}
                    </Link>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-blue-700 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}