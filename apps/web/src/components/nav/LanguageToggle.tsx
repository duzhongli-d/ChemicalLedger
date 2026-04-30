"use client";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useState, useEffect } from "react";

export function LanguageToggle() {
  // Use usePathname() for reactive updates during in-app navigation
  const pathname = usePathname();
  // Use window.location.pathname for initial locale detection (includes locale prefix)
  // Delay window access to client-side only via useEffect to avoid SSR error
  const [pathnameWithLocale, setPathnameWithLocale] = useState<string>("/");

  useEffect(() => {
    setPathnameWithLocale(window.location.pathname);
  }, []);

  const currentLocale = routing.locales.find((l) =>
    pathnameWithLocale.startsWith(`/${l}`)
  ) || routing.defaultLocale;

  const toggleLocale = () => {
    const newLocale = currentLocale === "zh" ? "en" : "zh";
    // Strip the current locale prefix from the full pathname
    const pathWithoutLocale = pathnameWithLocale.replace(/^\/(zh|en)/, "") || "/";
    // Use hard navigation to avoid next-intl locale-aware router prepending locale
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
  };

  return (
    <button
      onClick={toggleLocale}
      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary border-border transition-colors hover:bg-secondary/80"
      aria-label="Toggle language"
    >
      {currentLocale === "zh" ? "EN" : "中文"}
    </button>
  );
}