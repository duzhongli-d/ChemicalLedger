"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTheme } from "@/components/providers";
import { LanguageToggle } from "./LanguageToggle";

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

  const navLinks: NavLink[] = [
    { key: "home", label: t("home"), href: "/" },
    { key: "tech", label: t("tech"), href: "/#capabilities" },
    { key: "instruments", label: t("instruments"), href: "/#instruments" },
    { key: "about", label: t("about"), href: "/#about" },
    { key: "aiAssistant", label: t("aiAssistant"), href: "/ledgers" },
    { key: "deepResearch", label: t("deepResearch"), href: "/research" },
  ];

  return (
    <>
      <button
        className="md:hidden p-2 text-slate-700 dark:text-slate-200"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-8">
              <span className="font-semibold text-lg">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-lg py-2 border-b border-border"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-4">
              <LanguageToggle />
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}