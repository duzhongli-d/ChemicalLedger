"use client";

import { useTranslations } from "next-intl";

export default function AboutHeroHeader() {
  const t = useTranslations();

  return (
    <div className="relative bg-gradient-to-br from-muted/50 via-card/50 to-muted/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-orange-200 dark:border-[var(--border-accent)] overflow-hidden" style={{ backgroundImage: "url('/11.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
      {/* Dark overlay over background image */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950/90 dark:from-slate-950/80 dark:to-slate-950/90" />

      {/* Dot grid pattern overlay (reduced opacity) */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Orange accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

      {/* Content container */}
      <div className="relative max-w-[1320px] mx-auto px-4 py-20 text-center">
        {/* Orange accent badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 mb-6">
          <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-500 animate-pulse" />
          <span className="text-sm font-medium text-orange-400">{t("about.hero.badge")}</span>
        </div>

        {/* Main title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          {t("about.hero.title")}
        </h1>

        {/* Subtitle tagline */}
        <p className="text-lg md:text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
          {t("about.hero.subtitle")}
        </p>

        {/* Mission line */}
        <p className="text-base text-slate-400 max-w-3xl mx-auto">
          {t("about.hero.mission")}
        </p>

        {/* Bottom accent elements */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-400 dark:to-orange-500/50" />
          <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-500" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-400 dark:to-orange-500/50" />
        </div>
      </div>
    </div>
  );
}