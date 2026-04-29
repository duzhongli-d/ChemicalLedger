"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { LanguageToggle } from "./LanguageToggle";
import { MobileMenu } from "./MobileMenu";
import { useTheme } from "@/components/providers";
import clsx from "clsx";
import { QCDoorLogo } from "@/components/brand/QCDoorLogo";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isAdmin } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hash, setHash] = useState("");

  // Sync hash state with window.location.hash on mount and hash change
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    // Set initial hash on mount
    setHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const publicNavLinks = [
    { href: "/", label: t("home"), key: "home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/ledgers", label: t("aiAssistant"), key: "aiAssistant", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" },
    { href: "/research", label: t("deepResearch"), key: "deepResearch", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { href: "/#about", label: t("about"), key: "about", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { href: "/#contact", label: t("contact"), key: "contact", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  ];

  const isActive = (href: string) => {
    // Exact match for home page
    if (href === "/") return pathname === "/";
    // Hash links: only active when on homepage and hash matches
    if (href.includes("#")) {
      return pathname === "/" && hash === `#${href.split("#")[1]}`;
    }
    // Regular links: match pathname prefix
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        setIsHidden(false);
      }
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      }
      else if (currentScrollY < lastScrollY) {
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={clsx(
      "sticky top-0 z-50 transition-transform duration-300 backdrop-blur-md bg-background/80 border-b border-border/50",
      isHidden ? "-translate-y-full" : "translate-y-0"
    )}>
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <QCDoorLogo className="h-10 w-10" />
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/40 transition-colors" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">
              {t("brand")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {publicNavLinks.map((link, index) => (
              <Link
                key={link.key}
                href={link.href}
                className={clsx(
                  "nav-link flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg mx-0.5",
                  "nav-enter",
                  `nav-enter-delay-${index + 1}`,
                  isActive(link.href)
                    ? "active text-primary"
                    : "text-muted-foreground"
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border/50"
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
                  className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-600 text-white flex items-center justify-center font-medium shadow-lg shadow-orange-500/25">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden md:inline font-medium">{user?.username}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-border/50">
                      <p className="text-sm font-semibold">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.role === "admin" ? "管理员" : "用户"}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t("profile")}
                      </Link>
                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
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