"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="relative min-h-[650px] overflow-hidden" style={{ background: 'var(--hero-background)' }}>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, var(--hero-gradient-start) 0%, var(--hero-gradient-end) 100%)`
        }}
      />

      <div className="max-w-[1320px] mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 items-center min-h-[650px] py-12">
          {/* Left - Text content (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium animate-fade-in"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border-accent)',
                color: 'var(--accent)'
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse-node" style={{ background: 'var(--accent)' }} />
              {t("hero.badge")}
            </div>

            {/* Main headline */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-up stagger-1"
              style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
            >
              {t("hero.title")}
            </h1>

            {/* Slogan */}
            <p
              className="text-xl md:text-2xl font-semibold animate-slide-up stagger-2"
              style={{ color: 'var(--accent)', fontFamily: "'Plus Jakarta Sans', monospace" }}
            >
              {t("slogan")}
            </p>

            {/* Chinese slogan */}
            <p
              className="text-lg animate-slide-up stagger-3"
              style={{ color: 'var(--secondary)' }}
            >
              {t("sloganZh")}
            </p>

            {/* Description */}
            <p
              className="text-base md:text-lg max-w-2xl animate-slide-up stagger-4"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 animate-slide-up stagger-5">
              <Link
                href="/ledgers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover-lift glow-hover"
                style={{ background: 'var(--accent)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t("hero.cta1")}
              </Link>
              <Link
                href="/research"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {t("hero.cta2")}
              </Link>
            </div>

            {/* Metrics bar */}
            <div
              className="flex flex-wrap gap-8 pt-8 mt-4 animate-slide-up stagger-6"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', monospace", color: 'var(--accent)' }}>
                  12,580+
                </p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t("metrics.samples")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', monospace", color: 'var(--accent)' }}>
                  156
                </p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t("metrics.methods")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', monospace", color: 'var(--accent)' }}>
                  99.8%
                </p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t("metrics.auditRate")}</p>
              </div>
            </div>
          </div>

          {/* Right - Animated visualization (2/5 width) */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="relative w-full max-w-[320px] animate-float">
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full animate-spin-slow opacity-20"
                style={{ border: '2px solid var(--accent)', borderStyle: 'dashed' }}
              />

              {/* Main card */}
              <div
                className="relative rounded-2xl p-6 glass hover-lift"
                style={{ backdropFilter: 'blur(16px)' }}
              >
                {/* Hexagon grid pattern */}
                <div className="absolute inset-0 rounded-2xl opacity-10" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 2 L35 12 L35 28 L20 38 L5 28 L5 12 Z' fill='none' stroke='%230d9488' stroke-width='1'/%3E%3C/svg%3E")`,
                  backgroundSize: '40px 40px'
                }} />

                <div className="relative z-10">
                  {/* Chart title */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {t("hero.chartTitle")}
                    </h3>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: 'var(--accent)', color: 'white' }}
                    >
                      {t("hero.chartBadge")}
                    </span>
                  </div>

                  {/* Mini chart bars */}
                  <div className="flex items-end gap-2 h-24 mb-4">
                    {[65, 85, 45, 90, 70, 95, 55, 80, 60, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-all duration-300"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(180deg, var(--accent) 0%, var(--primary) 100%)`,
                          opacity: 0.7 + (i % 3) * 0.1,
                          animation: `slide-up 0.5s ease-out forwards`,
                          animationDelay: `${i * 50}ms`
                        }}
                      />
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>↑ 23%</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t("hero.stat1")}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>98.5%</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t("hero.stat2")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div
                className="absolute -right-4 top-1/4 px-3 py-2 rounded-lg glass text-xs font-medium animate-float shadow-lg"
                style={{ animationDelay: '1s' }}
              >
                <span style={{ color: 'var(--accent)' }}>✓</span>{" "}
                <span style={{ color: 'var(--foreground)' }}>{t("hero.badge1")}</span>
              </div>

              {/* Floating badge 2 */}
              <div
                className="absolute -left-4 bottom-1/4 px-3 py-2 rounded-lg glass text-xs font-medium animate-float shadow-lg"
                style={{ animationDelay: '2s' }}
              >
                <span style={{ color: 'var(--accent)' }}>⚡</span>{" "}
                <span style={{ color: 'var(--foreground)' }}>{t("hero.badge2")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{
          background: `linear-gradient(to bottom, transparent, var(--background))`
        }}
      />
    </section>
  );
}
