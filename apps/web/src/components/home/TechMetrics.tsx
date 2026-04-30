"use client";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";

const metrics = [
  { key: "samples", value: 50000, suffix: "+" },
  { key: "methods", value: 200, suffix: "+" },
  { key: "auditRate", value: 99.8, suffix: "%" },
];

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

function MetricCard({ metric, index, isVisible }: { metric: typeof metrics[0]; index: number; isVisible: boolean }) {
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
          <div className="text-4xl sm:text-5xl font-bold font-mono mb-2 text-orange-500">
            <AnimatedNumber value={metric.value} suffix={metric.suffix} isVisible={isVisible} />
          </div>
          <div className="text-slate-500 font-mono text-sm">{metric.key}</div>
        </div>
      </div>
    </div>
  );
}

export function TechMetrics() {
  const t = useTranslations("home");
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
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

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {metrics.map((m, i) => (
            <MetricCard key={m.key} metric={m} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
