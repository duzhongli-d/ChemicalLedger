"use client";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="relative min-h-[600px] overflow-hidden bg-slate-900 text-white">
      {/* Dot grid background */}
      <div className="absolute inset-0 bg-dot-grid opacity-50"></div>

      {/* Decorative glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 items-center min-h-[600px]">
          {/* Left - Molecular animation (2/5 width) */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <svg
              viewBox="0 0 300 300"
              className="w-full max-w-[300px] h-auto"
              aria-hidden="true"
            >
              {/* Connection lines */}
              <line x1="60" y1="80" x2="150" y2="100" className="stroke-teal-400/60" strokeWidth="1.5" />
              <line x1="150" y1="100" x2="240" y2="70" className="stroke-teal-400/60" strokeWidth="1.5" />
              <line x1="60" y1="80" x2="80" y2="180" className="stroke-teal-400/60" strokeWidth="1.5" />
              <line x1="80" y1="180" x2="150" y2="100" className="stroke-teal-400/60" strokeWidth="1.5" />
              <line x1="80" y1="180" x2="160" y2="240" className="stroke-teal-400/60" strokeWidth="1.5" />
              <line x1="150" y1="100" x2="160" y2="240" className="stroke-teal-400/60" strokeWidth="1.5" />
              <line x1="240" y1="70" x2="280" y2="160" className="stroke-teal-400/60" strokeWidth="1.5" />
              <line x1="280" y1="160" x2="240" y2="240" className="stroke-teal-400/60" strokeWidth="1.5" />
              <line x1="160" y1="240" x2="240" y2="240" className="stroke-teal-400/60" strokeWidth="1.5" />
              <line x1="150" y1="100" x2="240" y2="240" className="stroke-teal-400/40" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="60" y1="80" x2="160" y2="240" className="stroke-teal-400/40" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="240" y1="70" x2="160" y2="240" className="stroke-teal-400/40" strokeWidth="1" strokeDasharray="4 4" />

              {/* Nodes */}
              <circle cx="60" cy="80" r="8" className="fill-teal-400 animate-pulse-node" />
              <circle cx="150" cy="100" r="10" className="fill-teal-300 animate-pulse-node" style={{ animationDelay: '200ms' }} />
              <circle cx="240" cy="70" r="7" className="fill-teal-400 animate-pulse-node" style={{ animationDelay: '400ms' }} />
              <circle cx="80" cy="180" r="6" className="fill-teal-500 animate-pulse-node" style={{ animationDelay: '600ms' }} />
              <circle cx="160" cy="240" r="9" className="fill-teal-300 animate-pulse-node" style={{ animationDelay: '800ms' }} />
              <circle cx="280" cy="160" r="5" className="fill-teal-400 animate-pulse-node" style={{ animationDelay: '1000ms' }} />
              <circle cx="240" cy="240" r="6" className="fill-teal-500 animate-pulse-node" style={{ animationDelay: '1200ms' }} />

              {/* Center highlight node */}
              <circle cx="150" cy="100" r="16" className="fill-none stroke-teal-300/40" strokeWidth="2">
                <animate attributeName="r" values="16;24;16" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          {/* Right - Text content (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold animate-slide-up leading-tight"
              style={{ animationDelay: '0ms' }}
            >
              {t("hero.title")}
            </h1>
            <p
              className="text-xl md:text-2xl text-teal-400 font-mono animate-slide-up"
              style={{ animationDelay: '150ms' }}
            >
              {t("slogan")}
            </p>
            <p
              className="text-lg text-slate-400 animate-slide-up"
              style={{ animationDelay: '300ms' }}
            >
              {t("sloganZh")}
            </p>
            <p
              className="text-base md:text-lg text-slate-300 max-w-2xl animate-slide-up"
              style={{ animationDelay: '450ms' }}
            >
              {t("hero.subtitle")}
            </p>

            {/* Bottom metrics bar */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-700/50 mt-8 animate-slide-up" style={{ animationDelay: '600ms' }}>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-mono font-bold text-teal-400">12,580+</p>
                <p className="text-sm text-slate-400">{t("metrics.samples")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-mono font-bold text-teal-400">156</p>
                <p className="text-sm text-slate-400">{t("metrics.methods")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-mono font-bold text-teal-400">99.8%</p>
                <p className="text-sm text-slate-400">{t("metrics.auditRate")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
