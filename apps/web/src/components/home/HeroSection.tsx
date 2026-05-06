"use client";
import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const HERO_IMAGES = ["/1.png", "/2.png"];
const CAROUSEL_INTERVAL_MS = 5000;

export function HeroSection() {
  const t = useTranslations("home");
  const sectionRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [metricsData, setMetricsData] = useState<Array<{ label: string; batch_count: number | null }>>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchMetrics = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const categories = ['中控检测', '商务全检', '对照品标定', '研发全检'];
        const labels = [
          t("heroMetrics.zhongkong"),
          t("heroMetrics.businessFull"),
          t("heroMetrics.referenceStandard"),
          t("heroMetrics.rdFull"),
        ];

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(
          `${apiUrl}/public/annual-summaries/by-category?categories=${encodeURIComponent(categories.join(','))}&year=${previousYear}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const data = (json.data || []).map((item: { category: string; batch_count: number | null }, i: number) => ({
          label: labels[i] || item.category,
          batch_count: item.batch_count,
        }));

        setMetricsData(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Failed to fetch hero metrics:", err);
        setMetricsData([]);
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchMetrics();
    return () => controller.abort();
  }, [t]);

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[500px] md:min-h-[600px] overflow-hidden text-white">
      {/* Background images with crossfade */}
      {HERO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`hero-banner-img${i === currentIndex ? "" : " hero-banner-fade"}`}
          aria-hidden="true"
        />
      ))}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-r from-black/50 via-transparent to-black/30" />

      {/* Fallback dot-grid behind images */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 z-[1]" />

      <div className="max-w-[1320px] mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 items-center min-h-[500px] md:min-h-[600px]">

          {/* Left - Text content with logo (3/5 width) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title with staggered reveal */}
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight whitespace-nowrap animate-hero-title-reveal"
              style={{ animationDelay: '0.1s' }}
            >
              {t("hero.title")}
            </h1>

            {/* Slogan with English and Chinese */}
            <div
              className="space-y-2 animate-hero-subtitle-reveal"
              style={{ animationDelay: '0.2s' }}
            >
              <p className="text-xl sm:text-2xl md:text-3xl text-orange-500 font-mono">
                {t("slogan")}
              </p>
              <p className="text-lg md:text-xl text-white/80">
                {t("sloganZh")}
              </p>
            </div>

            {/* Subtitle description */}
            <p
              className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl animate-hero-subtitle-reveal"
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
                className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-medium text-white/80 border border-white/30 hover:border-orange-500/50 hover:text-orange-400 transition-all duration-300 hover:scale-105 group"
              >
                <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  {t("hero.secondaryCta")}
                </span>
              </Link>
            </div>

            {/* Bottom metrics bar */}
            {!metricsLoading && metricsData.length > 0 && (
              <div
                className="flex flex-wrap gap-8 pt-8 border-t border-white/20 mt-8 animate-hero-cta-reveal"
                style={{ animationDelay: '0.5s' }}
              >
                {metricsData.map((metric, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-orange-500">
                      {metric.batch_count !== null && metric.batch_count !== undefined
                        ? metric.batch_count.toLocaleString()
                        : '—'}
                    </p>
                    <p className="text-sm text-white/60">{metric.label}</p>
                  </div>
                ))}
              </div>
            )}
            {!metricsLoading && metricsData.length === 0 && (
              <div className="flex flex-wrap gap-8 pt-8 border-t border-white/20 mt-8 animate-hero-cta-reveal" style={{ animationDelay: '0.5s' }}>
                <p className="text-sm text-white/60">暂无数据</p>
              </div>
            )}
            {metricsLoading && (
              <div className="flex flex-wrap gap-8 pt-8 border-t border-white/20 mt-8 animate-hero-cta-reveal" style={{ animationDelay: '0.5s' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} className="space-y-1 animate-pulse">
                    <div className="h-8 w-20 bg-white/10 rounded" />
                    <div className="h-4 w-16 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - Chromatogram animation (2/5 width) */}
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

        </div>
      </div>
    </section>
  );
}