"use client";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="relative min-h-[600px] overflow-hidden bg-slate-900 text-white">
      {/* Dot grid background */}
      <div className="absolute inset-0 bg-dot-grid opacity-50"></div>

      {/* Data flow background - animated horizontal lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              width: "200%",
              left: "-100%",
              animation: `flow-data ${3 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Chromatogram peak SVG */}
      <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 opacity-20">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          <defs>
            <linearGradient id="peakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(11,130,232,0.8)" />
              <stop offset="100%" stopColor="rgba(11,130,232,0)" />
            </linearGradient>
          </defs>
          {/* Gaussian-like chromatogram peak */}
          <path
            d="M 50 200 Q 100 200 120 180 Q 140 100 160 20 Q 180 100 200 180 Q 220 200 270 200 L 270 200 L 50 200 Z"
            fill="url(#peakGradient)"
            className="animate-pulse-node"
          />
          {/* Peak line */}
          <path
            d="M 50 200 Q 100 200 120 180 Q 140 100 160 20 Q 180 100 200 180 Q 220 200 270 200"
            fill="none"
            stroke="rgba(11,130,232,0.6)"
            strokeWidth="2"
            className="animate-draw-line"
          />
        </svg>
      </div>

      {/* Decorative glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]"></div>

      <div className="max-w-[1320px] mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 items-center min-h-[600px]">
          {/* Left - Chromatogram animation (2/5 width) */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <svg
              viewBox="0 0 300 300"
              className="w-full max-w-[300px] h-auto"
              aria-hidden="true"
            >
              {/* Chromatogram baseline */}
              <line x1="30" y1="250" x2="270" y2="250" stroke="rgba(11,130,232,0.3)" strokeWidth="1" />

              {/* Grid lines */}
              {[50, 100, 150, 200].map((y) => (
                <line key={y} x1="30" y1={y} x2="270" y2={y} stroke="rgba(11,130,232,0.1)" strokeWidth="0.5" strokeDasharray="4 4" />
              ))}

              {/* Chromatogram peaks */}
              <path
                d="M 40 250 Q 60 250 70 240 Q 80 200 90 250"
                fill="none"
                stroke="rgba(11,130,232,0.5)"
                strokeWidth="2"
                className="animate-draw-line"
              />
              <path
                d="M 100 250 Q 120 250 130 230 Q 140 150 150 250"
                fill="none"
                stroke="rgba(11,130,232,0.6)"
                strokeWidth="2"
                className="animate-draw-line"
                style={{ animationDelay: '200ms' }}
              />
              <path
                d="M 160 250 Q 180 250 190 200 Q 200 80 210 250"
                fill="none"
                stroke="rgba(11,130,232,0.8)"
                strokeWidth="3"
                className="animate-pulse-node"
                style={{ animationDelay: '400ms' }}
              />
              <path
                d="M 220 250 Q 240 250 250 220 Q 260 180 270 250"
                fill="none"
                stroke="rgba(11,130,232,0.5)"
                strokeWidth="2"
                className="animate-draw-line"
                style={{ animationDelay: '600ms' }}
              />

              {/* Data point nodes */}
              <circle cx="90" cy="250" r="4" className="fill-primary-500 animate-pulse-node" style={{ animationDelay: '100ms' }} />
              <circle cx="150" cy="250" r="5" className="fill-primary-500 animate-pulse-node" style={{ animationDelay: '300ms' }} />
              <circle cx="210" cy="80" r="6" className="fill-teal-400 animate-pulse-node" style={{ animationDelay: '500ms' }} />
              <circle cx="270" cy="250" r="4" className="fill-primary-500 animate-pulse-node" style={{ animationDelay: '700ms' }} />

              {/* Center highlight */}
              <circle cx="210" cy="80" r="20" className="fill-none stroke-teal-300/40" strokeWidth="2">
                <animate attributeName="r" values="20;30;20" dur="3s" repeatCount="indefinite" />
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