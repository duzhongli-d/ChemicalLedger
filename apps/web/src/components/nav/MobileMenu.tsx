"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTheme } from "@/components/providers";
import { LanguageToggle } from "./LanguageToggle";
import { useAuthStore } from "@/lib/auth-store";

interface NavLink {
  key: string;
  label: string;
  href: string;
  requiresAuth?: boolean;
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuthStore();

  const navLinks: NavLink[] = [
    { key: "home", label: t("home"), href: "/" },
    { key: "tech", label: t("tech"), href: "/#capabilities" },
    { key: "instruments", label: t("instruments"), href: "/#instruments" },
    { key: "aiAssistant", label: t("aiAssistant"), href: "/ledgers" },
    { key: "deepResearch", label: t("deepResearch"), href: "/research" },
    { key: "about", label: t("about"), href: "/#about" },
  ];

  return (
    <>
      <button
        className="lg:hidden p-2.5 rounded-lg transition-all duration-300"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <div className="relative w-5 h-5">
          <span
            className={`absolute left-0 w-5 h-0.5 rounded-full transition-all duration-300 ${open ? 'rotate-45 top-2' : 'top-1'}`}
            style={{ background: 'var(--foreground)' }}
          />
          <span
            className={`absolute left-0 top-2 w-5 h-0.5 rounded-full transition-all duration-300 ${open ? 'opacity-0' : ''}`}
            style={{ background: 'var(--foreground)' }}
          />
          <span
            className={`absolute left-0 w-5 h-0.5 rounded-full transition-all duration-300 ${open ? '-rotate-45 top-2' : 'top-3'}`}
            style={{ background: 'var(--foreground)' }}
          />
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'var(--background)', opacity: 0.8 }}
            onClick={() => setOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] shadow-2xl animate-in slide-in-from-right duration-300"
            style={{
              background: 'var(--card)',
              backdropFilter: 'blur(16px)',
              borderLeft: '1px solid var(--border)'
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--primary)' }}
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0-6v6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Menu</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--muted)' }}
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--foreground)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col p-5 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200"
                  style={{ color: 'var(--foreground)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                    style={{ background: 'var(--secondary)' }}
                  />
                  <span className="group-hover:opacity-80 transition-opacity">
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Auth Links */}
            {isAuthenticated() && (
              <div
                className="mx-5 p-4 rounded-lg mb-4"
                style={{
                  background: 'var(--accent)',
                  opacity: 0.1,
                  border: '1px solid var(--border-accent)'
                }}
              >
                <p
                  className="text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--accent)' }}
                >
                  Quick Access
                </p>
                <div className="flex flex-col gap-1">
                  <Link href="/ledgers" onClick={() => setOpen(false)} className="text-sm py-1" style={{ color: 'var(--foreground)' }}>台账管理</Link>
                  <Link href="/research" onClick={() => setOpen(false)} className="text-sm py-1" style={{ color: 'var(--foreground)' }}>深度调研</Link>
                  {isAdmin() && <Link href="/admin/users" onClick={() => setOpen(false)} className="text-sm py-1" style={{ color: 'var(--foreground)' }}>管理后台</Link>}
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              className="absolute bottom-0 left-0 right-0 p-5"
              style={{
                borderTop: '1px solid var(--border)',
                background: 'var(--card)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2.5 rounded-lg transition-all duration-300"
                    style={{
                      background: 'var(--muted)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    {theme === "dark" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#fbbf24' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--muted-foreground)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>
                </div>
                {!isAuthenticated() && (
                  <div className="flex items-center gap-2">
                    <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm transition-colors" style={{ color: 'var(--foreground)' }}>
                      {t("login")}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all"
                      style={{
                        background: 'var(--primary)',
                        color: 'white'
                      }}
                    >
                      {t("register")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
