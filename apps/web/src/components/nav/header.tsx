"use client";

import { useState, useEffect } from "react";
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
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/#capabilities", label: t("tech") },
    { href: "/ledgers", label: t("aiAssistant") },
    { href: "/research", label: t("deepResearch") },
    { href: "/#about", label: t("about") },
    ...(isAuthenticated() ? [
      { href: "/notifications", label: t("notifications") || "通知" },
      { href: "/admin/users", label: t("admin") },
    ] : []),
    ...(isAdmin() && isAuthenticated() ? [] : []),
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setIsHidden(false);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setIsHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isHidden ? "-translate-y-full" : "translate-y-0",
        isLoaded ? "opacity-100" : "opacity-0"
      )}
      style={{
        background: 'var(--nav-background)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--nav-border)',
      }}
    >
      {/* Accent line top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, var(--accent), transparent)`
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-lg blur-xl transition-all duration-300"
                style={{ background: 'var(--accent)', opacity: 0.3 }}
              />
              <div
                className="relative w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, var(--accent) 0%, var(--teal-600) 100%)`
                }}
              >
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0-6v6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: 'var(--foreground)' }}
              >
                雅本化学 <span style={{ color: 'var(--accent)' }}>QC</span>
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] font-medium"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Quality Control
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "group relative px-4 py-2 text-sm font-medium transition-all duration-300",
                  "hover:opacity-80",
                  pathname === link.href
                    ? ""
                    : ""
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span
                  className="relative z-10 transition-colors"
                  style={{
                    color: pathname === link.href ? 'var(--accent)' : 'var(--foreground)'
                  }}
                >
                  {link.label}
                </span>
                {/* Animated underline */}
                <span
                  className={clsx(
                    "absolute bottom-0 left-4 right-4 h-0.5 rounded-full",
                    "transform origin-left transition-transform duration-300"
                  )}
                  style={{
                    background: 'var(--accent)',
                    transform: pathname === link.href ? 'scaleX(1)' : 'scaleX(0)'
                  }}
                />
                {/* Glow effect on active */}
                {pathname === link.href && (
                  <span
                    className="absolute inset-0 rounded-lg blur-sm"
                    style={{ background: 'var(--accent)', opacity: 0.1 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-lg transition-all duration-300 hover-lift"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)'
              }}
              aria-label="Toggle theme"
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

            <LanguageToggle />
            <MobileMenu />

            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300"
                  style={{
                    background: 'var(--accent)',
                    opacity: 0.1
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, var(--accent) 0%, var(--teal-600) 100%)`
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                  <span
                    className="hidden md:inline text-sm font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {user?.username}
                  </span>
                  <svg
                    className={clsx("w-4 h-4 transition-transform duration-200", menuOpen && "rotate-180")}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{
                      background: 'var(--card)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{
                        background: `linear-gradient(to right, var(--accent), transparent)`,
                        opacity: 0.1
                      }}
                    >
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{user?.username}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user?.role === "admin" ? "管理员 Admin" : "用户 User"}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--foreground)' }}
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t("profile")}
                      </Link>
                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--error)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium transition-colors"
                  style={{ color: 'var(--foreground)' }}
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover-lift shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, var(--accent) 0%, var(--teal-600) 100%)`,
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

      {/* Accent line bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, var(--border-accent), transparent)`
        }}
      />
    </header>
  );
}
