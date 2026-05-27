'use client';

import { useTranslations } from 'next-intl';

export default function CertsHeroHeader() {
  const t = useTranslations('certs');

  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-emerald-500/20 overflow-hidden"
         style={{ backgroundImage: "url('/26.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950/90" />

      {/* Dot grid pattern overlay */}
      <div className="absolute inset-0 opacity-10"
           style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      {/* Emerald accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

      {/* Content */}
      <div className="relative max-w-[1320px] mx-auto px-4 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-emerald-400">{t('hero.badge')}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          {t('hero.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>

        {/* Description */}
        <p className="text-base text-slate-400 max-w-3xl mx-auto">
          {t('hero.description')}
        </p>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-500/50" />
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-500/50" />
        </div>
      </div>
    </div>
  );
}