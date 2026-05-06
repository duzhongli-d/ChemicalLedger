"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface AnnualSummaryResponse {
  year: number;
  data: AnnualSummaryItem[];
  message?: string;
}

interface AnnualSummaryItem {
  section: string;
  project_count: number;
  batch_count: number | null;
}

type MetricCard = {
  key: string;
  primaryValue: number;
  primaryUnit: string;
  secondaryValue?: number;
  secondaryUnit?: string;
  label: string;
  hasError: boolean;
};

// Progress ring values (0-100) for each metric
const progressValues = [85, 72, 95];

function AnimatedNumber({ value, suffix, isVisible }: { value: number; suffix: string; isVisible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, isVisible]);

  const displayValue = value % 1 === 0 ? count.toLocaleString() : count.toFixed(1);
  return <span>{displayValue}{suffix}</span>;
}

function ProgressRing({ progress, isVisible, delay = 0 }: { progress: number; isVisible: boolean; delay?: number }) {
  const [offset, setOffset] = useState(283);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => {
        setOffset(strokeDashoffset);
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      setOffset(circumference);
    }
  }, [isVisible, strokeDashoffset, delay, circumference]);

  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
      {/* Background ring - subtle for light theme */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(249, 115, 22, 0.08)"
        strokeWidth="3"
      />
      {/* Progress ring - decorative gradient */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 1.5s ease-out',
        }}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MetricCard({ metric, index, isVisible }: { metric: MetricCard; index: number; isVisible: boolean }) {
  const t = useTranslations("home.metrics");

  return (
    <div
      className={`
        relative overflow-hidden
        transform transition-all duration-700
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
      `}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Progress ring as decorative background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <ProgressRing progress={progressValues[index]} isVisible={isVisible} delay={index * 150} />
      </div>

      {/* Card content */}
      <div className="relative z-10 bg-white rounded-2xl p-6 sm:p-8 text-center border border-slate-200 hover:border-orange-400/50 transition-colors shadow-sm">
        <div className="relative">
          <div className="mt-1">
            {metric.hasError ? (
              <span className="text-3xl">{t("noData")}</span>
            ) : (
              <div className="flex flex-wrap items-baseline justify-center gap-x-1">
                <span className="text-5xl sm:text-6xl font-bold font-mono text-orange-500">
                  {metric.primaryValue.toLocaleString()}
                </span>
                <span className="text-base sm:text-lg font-medium text-slate-400">
                  {metric.primaryUnit}
                </span>
                {metric.secondaryValue !== undefined && (
                  <>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-3xl sm:text-4xl font-bold font-mono text-orange-500">
                      {metric.secondaryValue.toLocaleString()}
                    </span>
                    <span className="text-base sm:text-lg font-medium text-slate-400">
                      {metric.secondaryUnit}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="text-slate-500 font-mono text-sm">{metric.label}</div>
        </div>
      </div>
    </div>
  );
}

export function TechMetrics() {
  const t = useTranslations("home");
  const tMetrics = useTranslations("home.metrics");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh";
  const isZh = locale === "zh";
  const projectUnit = isZh ? "个项目" : " Projects";
  const batchUnit = isZh ? "批次" : " Batches";
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      setLoading(true);
      setError(false);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const response = await fetch(`${apiUrl}/public/annual-summaries/previous-year`);

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const result: AnnualSummaryResponse = await response.json();
        const data = result.data;

        // Aggregate data by section (sum project_count and batch_count per section)
        const aggregated = data.reduce(
          (acc, item) => {
            if (!acc[item.section]) {
              acc[item.section] = { project_count: 0, batch_count: 0 };
            }
            acc[item.section].project_count += item.project_count;
            if (item.batch_count) {
              acc[item.section].batch_count += item.batch_count;
            }
            return acc;
          },
          {} as Record<string, { project_count: number; batch_count: number }>
        );

        const card1 = aggregated["sample_testing"];
        const card2 = aggregated["method_dev"];
        const card3 = aggregated["stability_test"];

        const mappedMetrics: MetricCard[] = [
          {
            key: "sample_testing",
            primaryValue: card1.project_count,
            primaryUnit: projectUnit,
            secondaryValue: card1.batch_count ?? 0,
            secondaryUnit: batchUnit,
            label: tMetrics("card1.label"),
            hasError: !card1,
          },
          {
            key: "method_dev",
            primaryValue: card2.project_count,
            primaryUnit: projectUnit,
            label: tMetrics("card2.label"),
            hasError: !card2,
          },
          {
            key: "stability_test",
            primaryValue: card3.project_count,
            primaryUnit: projectUnit,
            label: tMetrics("card3.label"),
            hasError: !card3,
          },
        ];

        setMetrics(mappedMetrics);
      } catch (err) {
        console.error("Failed to fetch annual summaries:", err);
        setError(true);
        // Set error state for all cards
        setMetrics([
          { key: "sample_testing", primaryValue: 0, primaryUnit: projectUnit, secondaryValue: 0, secondaryUnit: batchUnit, label: tMetrics("card1.label"), hasError: true },
          { key: "method_dev", primaryValue: 0, primaryUnit: projectUnit, label: tMetrics("card2.label"), hasError: true },
          { key: "stability_test", primaryValue: 0, primaryUnit: projectUnit, label: tMetrics("card3.label"), hasError: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted, tMetrics, pathname]);

  return (
    <section ref={sectionRef} className="py-20 sm:py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dot-grid opacity-30" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-[120px]" />

      <div className="max-w-[1320px] mx-auto px-4 relative z-10">
        <h2 className={`text-xl sm:text-2xl font-bold mb-4 text-center font-mono transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {t("metrics.title")}
        </h2>
        <p className={`text-muted-foreground text-center mb-12 transition-all duration-700 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {t("metrics.subtitle")}
        </p>

        {loading ? (
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  relative overflow-hidden
                  transform transition-all duration-700
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
                `}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Animated placeholder rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <div className="w-[100px] h-[100px] rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                </div>

                {/* Card content placeholder */}
                <div className="relative z-10 bg-white rounded-2xl p-6 sm:p-8 text-center border border-slate-200 shadow-sm">
                  <div className="h-[48px] w-full bg-slate-100 rounded-lg animate-pulse mb-2" />
                  <div className="h-[16px] w-24 bg-slate-100 rounded animate-pulse mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {metrics.map((m, i) => (
              <MetricCard key={m.key} metric={m} index={i} isVisible={isVisible} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
