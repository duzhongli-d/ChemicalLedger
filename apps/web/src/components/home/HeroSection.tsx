"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function HeroSection() {
  const t = useTranslations("home");
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative min-h-[500px] md:min-h-[600px] overflow-hidden bg-gradient-to-br from-teal-50 via-white to-orange-50/30 text-slate-900">
      {/* Gradient mesh background */}
      <div className="absolute inset-0">
        {/* Primary gradient orbs - reduced opacity for light theme */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/[0.06] via-orange-600/[0.04] to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/[0.06] via-teal-600/[0.04] to-transparent rounded-full blur-[100px]" />
        {/* Additional mesh points */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-t from-orange-500/[0.04] via-transparent to-teal-500/[0.04] rounded-full blur-[80px]" />
      </div>

      {/* Dot grid background */}
      <div className="absolute inset-0 bg-dot-grid opacity-60" />

      {/* Data flow background - animated horizontal lines - lighter color */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-slate-400/20 to-transparent"
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

      {/* Chromatogram peak SVG - adjusted for light background */}
      <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 opacity-[0.08]">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          <defs>
            <linearGradient id="peakGradientHero" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(249,115,22,0.5)" />
              <stop offset="100%" stopColor="rgba(249,115,22,0)" />
            </linearGradient>
          </defs>
          {/* Gaussian-like chromatogram peak */}
          <path
            d="M 50 200 Q 100 200 120 180 Q 140 100 160 20 Q 180 100 200 180 Q 220 200 270 200 L 270 200 L 50 200 Z"
            fill="url(#peakGradientHero)"
            className="animate-pulse-node"
          />
          {/* Peak line */}
          <path
            d="M 50 200 Q 100 200 120 180 Q 140 100 160 20 Q 180 100 200 180 Q 220 200 270 200"
            fill="none"
            stroke="rgba(249,115,22,0.35)"
            strokeWidth="2"
            className="animate-draw-line"
          />
        </svg>
      </div>

      {/* Decorative glow - layered - reduced opacity */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/[0.08] rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-teal-500/[0.06] rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />

      <div className="max-w-[1320px] mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 items-center min-h-[500px] md:min-h-[600px]">
          {/* Left - Chromatogram animation (2/5 width) */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <svg
              viewBox="0 0 300 300"
              className="w-full max-w-[300px] h-auto animate-hero-svg-reveal"
              aria-hidden="true"
            >
              {/* Chromatogram baseline */}
              <line x1="30" y1="250" x2="270" y2="250" stroke="rgba(249,115,22,0.2)" strokeWidth="1" />

              {/* Grid lines */}
              {[50, 100, 150, 200].map((y) => (
                <line key={y} x1="30" y1={y} x2="270" y2={y} stroke="rgba(249,115,22,0.06)" strokeWidth="0.5" strokeDasharray="4 4" />
              ))}

              {/* Chromatogram peaks */}
              <path
                d="M 40 250 Q 60 250 70 240 Q 80 200 90 250"
                fill="none"
                stroke="rgba(249,115,22,0.35)"
                strokeWidth="2"
                className="animate-draw-line"
              />
              <path
                d="M 100 250 Q 120 250 130 230 Q 140 150 150 250"
                fill="none"
                stroke="rgba(249,115,22,0.45)"
                strokeWidth="2"
                className="animate-draw-line"
                style={{ animationDelay: '200ms' }}
              />
              <path
                d="M 160 250 Q 180 250 190 200 Q 200 80 210 250"
                fill="none"
                stroke="rgba(249,115,22,0.6)"
                strokeWidth="3"
                className="animate-pulse-node"
                style={{ animationDelay: '400ms' }}
              />
              <path
                d="M 220 250 Q 240 250 250 220 Q 260 180 270 250"
                fill="none"
                stroke="rgba(249,115,22,0.35)"
                strokeWidth="2"
                className="animate-draw-line"
                style={{ animationDelay: '600ms' }}
              />

              {/* Data point nodes */}
              <circle cx="90" cy="250" r="4" className="fill-orange-500 animate-pulse-node" style={{ animationDelay: '100ms' }} />
              <circle cx="150" cy="250" r="5" className="fill-orange-500 animate-pulse-node" style={{ animationDelay: '300ms' }} />
              <circle cx="210" cy="80" r="6" className="fill-orange-500 animate-pulse-node" style={{ animationDelay: '500ms' }} />
              <circle cx="270" cy="250" r="4" className="fill-orange-500 animate-pulse-node" style={{ animationDelay: '700ms' }} />

              {/* Center highlight */}
              <circle cx="210" cy="80" r="20" className="fill-none stroke-orange-300/30" strokeWidth="2">
                <animate attributeName="r" values="20;30;20" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          {/* Right - Text content (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title with staggered reveal */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-hero-title-reveal"
              style={{ animationDelay: '0.1s' }}
            >
              {t("hero.title")}
            </h1>

            {/* Slogan with English and Chinese */}
            <div
              className="space-y-2 animate-hero-subtitle-reveal"
              style={{ animationDelay: '0.2s' }}
            >
              <p className="text-lg sm:text-xl md:text-2xl text-orange-500 font-mono">
                {t("slogan")}
              </p>
              <p className="text-base md:text-lg text-slate-500">
                {t("sloganZh")}
              </p>
            </div>

            {/* Subtitle description */}
            <p
              className="text-sm md:text-base lg:text-lg text-slate-600 max-w-2xl animate-hero-subtitle-reveal"
              style={{ animationDelay: '0.3s' }}
            >
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap gap-4 pt-4 animate-hero-cta-reveal"
              style={{ animationDelay: '0.4s' }}
            >
              <Link
                href="/ledgers"
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-medium text-white overflow-hidden transition-all duration-300 hover:scale-105"
              >
                {/* Button gradient background */}
                <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700" />

                {/* Shine effect */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                    animation: 'shimmer 2s ease-in-out infinite',
                  }}
                />

                {/* Glow on hover */}
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 30px rgba(249,115,22,0.4), 0 0 60px rgba(249,115,22,0.2)' }} />

                {/* Button text */}
                <span className="relative z-10 flex items-center gap-2">
                  {t("hero.cta")}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/login"
                className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-medium text-slate-600 border border-slate-300 hover:border-orange-500/50 hover:text-orange-600 transition-all duration-300 hover:scale-105 group"
              >
                <span className="absolute inset-0 rounded-xl bg-slate-100/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  {t("hero.secondaryCta")}
                </span>
              </Link>
            </div>

            {/* Bottom metrics bar */}
            <div
              className="flex flex-wrap gap-8 pt-8 border-t border-slate-200 mt-8 animate-hero-cta-reveal"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-orange-500">12,580+</p>
                <p className="text-sm text-slate-500">{t("metrics.samples")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-orange-500">156</p>
                <p className="text-sm text-slate-500">{t("metrics.methods")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-orange-500">99.8%</p>
                <p className="text-sm text-slate-500">{t("metrics.auditRate")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
