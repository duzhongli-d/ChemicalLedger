"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const metrics = [
  { key: "samples", value: 50000, suffix: "+", label: "检测样本" },
  { key: "methods", value: 200, suffix: "+", label: "检测方法" },
  { key: "auditRate", value: 99.8, suffix: "%", label: "审计通过率" },
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
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"></div>

      {/* Decorative circular gauges */}
      <div className="absolute top-8 right-8 w-32 h-32 border-4 border-slate-700 rounded-full opacity-30"></div>
      <div className="absolute bottom-8 left-8 w-24 h-24 border-4 border-slate-700 rounded-full opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-2xl font-bold mb-4 text-center font-mono">{t("metrics.title")}</h2>
        <p className="text-slate-400 text-center mb-12">Precision Data, Trusted Results</p>

        <div className="grid md:grid-cols-3 gap-8">
          {metrics.map((m, i) => (
            <div key={m.key} className="glass rounded-2xl p-8 text-center relative">
              <div className="text-5xl font-bold font-mono mb-2">
                <AnimatedNumber value={m.value} suffix={m.suffix} />
              </div>
              <div className="text-teal-400 font-mono text-sm">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
