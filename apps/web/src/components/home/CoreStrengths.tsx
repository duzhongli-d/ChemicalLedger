"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const strengths = [
  {
    key: "compliance",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    key: "equipment",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    key: "ai",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

interface StrengthCardProps {
  strength: typeof strengths[0];
  index: number;
  isVisible: boolean;
  t: ReturnType<typeof useTranslations>;
}

function StrengthCard({ strength, index, isVisible, t }: StrengthCardProps) {
  return (
    <div
      className={`
        relative group overflow-hidden rounded-2xl p-8 bg-white border border-slate-200
        transition-all duration-500 ease-out
        hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-[1.02]
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
      `}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Icon container */}
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 border border-orange-400/30 transition-transform duration-300 group-hover:scale-110">
        <div className="text-white">
          {strength.icon}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground mb-2 font-mono">{t(`strengths.${strength.key}`)}</h3>
        <p className="text-muted-foreground">{t(`strengths.${strength.key}Desc`)}</p>
      </div>
    </div>
  );
}

export function CoreStrengths() {
  const t = useTranslations("home");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <section id="capabilities" ref={sectionRef} className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dot-grid opacity-30" />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-[60px]" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-teal-500/5 rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section title */}
        <h2 className={`text-xl sm:text-2xl font-bold text-foreground mb-8 text-center font-mono transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {t("strengths.title")}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {strengths.map((s, i) => (
            <StrengthCard key={s.key} strength={s} index={i} isVisible={isVisible} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
