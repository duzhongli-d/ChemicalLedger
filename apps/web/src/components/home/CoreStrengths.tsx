"use client";
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

export function CoreStrengths() {
  const t = useTranslations("home");
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: 'var(--muted)' }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {strengths.map((s, index) => (
            <div
              key={s.key}
              className="glass rounded-2xl p-8 relative group overflow-hidden transition-all duration-300 hover-lift card-gradient-border"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slide-up 0.6s ease-out forwards',
                opacity: 0
              }}
            >
              {/* Icon container with gradient */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
                }}
              >
                <div className="text-white">{s.icon}</div>
              </div>

              <h3
                className="text-xl font-bold mb-2"
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  color: 'var(--foreground)'
                }}
              >
                {t(`strengths.${s.key}`)}
              </h3>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {t(`strengths.${s.key}Desc`)}
              </p>

              {/* Hover glow effect */}
              <div
                className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
                style={{ background: 'var(--accent)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
