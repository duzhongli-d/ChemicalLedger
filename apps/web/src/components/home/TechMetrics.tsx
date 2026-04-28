"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const metrics = [
  { key: "samples", value: 50000, suffix: "+" },
  { key: "methods", value: 200, suffix: "+" },
  { key: "auditRate", value: 99.8, suffix: "%" },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
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
  }, [value]);

  const displayValue = value % 1 === 0 ? count.toLocaleString() : count.toFixed(1);
  return <span>{displayValue}{suffix}</span>;
}

export function TechMetrics() {
  const t = useTranslations("home");
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: 'var(--slate-900)' }}
    >
      {/* Background glow effects */}
      <div
        className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-[120px]"
        style={{ background: 'var(--accent)', opacity: 0.1 }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full blur-[120px]"
        style={{ background: 'var(--primary)', opacity: 0.08 }}
      />

      <div className="max-w-[1320px] mx-auto px-4 relative z-10">
        <h2
          className="text-2xl font-bold mb-4 text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', monospace", color: 'var(--foreground)' }}
        >
          {t("metrics.title")}
        </h2>
        <p className="text-center mb-12" style={{ color: 'var(--muted-foreground)' }}>
          {t("metrics.subtitle")}
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {metrics.map((m, i) => (
            <div
              key={m.key}
              className="glass rounded-2xl p-8 text-center relative"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className="text-5xl font-bold mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', monospace", color: 'var(--foreground)' }}
              >
                <AnimatedNumber value={m.value} suffix={m.suffix} />
              </div>
              <div
                className="font-mono text-sm"
                style={{ color: 'var(--accent)' }}
              >
                {t("metrics." + m.key + "Label")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
