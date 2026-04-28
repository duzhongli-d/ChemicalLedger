"use client";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageToggle() {
  const pathname = usePathname();
  const currentLocale = routing.locales.find((l) =>
    pathname.startsWith(`/${l}`)
  ) || routing.defaultLocale;

  const toggleLocale = () => {
    const newLocale = currentLocale === "zh-CN" ? "en" : "zh-CN";
    // Strip the current locale prefix from the full pathname
    const pathWithoutLocale = pathname.replace(/^\/(zh-CN|en)/, "") || "/";
    // Use hard navigation to avoid next-intl locale-aware router prepending locale
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
  };

  return (
    <button
      onClick={toggleLocale}
      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
      aria-label="Toggle language"
    >
      {currentLocale === "zh-CN" ? "EN" : "中文"}
    </button>
  );
}