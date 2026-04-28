"use client";
import { useTranslations } from "next-intl";

function DNAHelixAnimation({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* DNA double helix strands */}
      <path
        d="M30 10 Q60 30 90 10 Q60 30 30 50 Q60 70 90 50 Q60 70 30 90 Q60 110 90 90"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="animate-pulse opacity-60"
      />
      <path
        d="M90 10 Q60 30 30 10 Q60 30 90 50 Q60 70 30 50 Q60 70 90 90 Q60 110 30 90"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="animate-pulse opacity-60"
        style={{ animationDelay: "0.5s" }}
      />
      {/* Base pairs */}
      <line x1="42" y1="22" x2="78" y2="22" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="42" y1="42" x2="78" y2="42" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="42" y1="62" x2="78" y2="62" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="42" y1="82" x2="78" y2="82" stroke={color} strokeWidth="1.5" opacity="0.4" />
      {/* Animated nodes */}
      <circle cx="30" cy="10" r="4" className="animate-pulse" fill={color} opacity="0.5" />
      <circle cx="90" cy="10" r="4" className="animate-pulse" fill={color} opacity="0.5" />
      <circle cx="30" cy="50" r="4" className="animate-pulse" fill={color} opacity="0.5" style={{ animationDelay: "0.3s" }} />
      <circle cx="90" cy="50" r="4" className="animate-pulse" fill={color} opacity="0.5" style={{ animationDelay: "0.3s" }} />
      <circle cx="30" cy="90" r="4" className="animate-pulse" fill={color} opacity="0.5" style={{ animationDelay: "0.6s" }} />
      <circle cx="90" cy="90" r="4" className="animate-pulse" fill={color} opacity="0.5" style={{ animationDelay: "0.6s" }} />
    </svg>
  );
}

function MolecularStructure({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Atoms as circles */}
      <circle cx="35" cy="35" r="10" className="animate-pulse" fill={color} opacity="0.4" />
      <circle cx="85" cy="30" r="7" className="animate-pulse" fill={color} opacity="0.5" style={{ animationDelay: "0.4s" }} />
      <circle cx="60" cy="75" r="9" className="animate-pulse" fill={color} opacity="0.45" style={{ animationDelay: "0.8s" }} />
      <circle cx="90" cy="70" r="6" className="animate-pulse" fill={color} opacity="0.5" style={{ animationDelay: "1.2s" }} />
      <circle cx="25" cy="80" r="5" className="animate-pulse" fill={color} opacity="0.4" style={{ animationDelay: "0.6s" }} />
      {/* Bonds as lines */}
      <line x1="35" y1="35" x2="85" y2="30" stroke={color} strokeWidth="2" opacity="0.3" />
      <line x1="85" y1="30" x2="60" y2="75" stroke={color} strokeWidth="2" opacity="0.3" />
      <line x1="60" y1="75" x2="90" y2="70" stroke={color} strokeWidth="2" opacity="0.3" />
      <line x1="60" y1="75" x2="25" y2="80" stroke={color} strokeWidth="2" opacity="0.3" />
      <line x1="35" y1="35" x2="25" y2="80" stroke={color} strokeWidth="1.5" opacity="0.2" />
      <line x1="85" y1="30" x2="90" y2="70" stroke={color} strokeWidth="1.5" opacity="0.2" />
    </svg>
  );
}

export function TeamShowcase() {
  const t = useTranslations("home");

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: 'var(--muted)' }}
    >
      <div className="max-w-[1320px] mx-auto px-4">
        <h2
          className="text-2xl font-bold mb-8 text-center"
          style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
        >
          {t("team.title")}
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Professional Team Card */}
          <div
            className="rounded-2xl p-6 overflow-hidden relative group hover-lift"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="h-56 rounded-xl mb-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, var(--accent) 10%, var(--primary) 100%)`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <DNAHelixAnimation color="rgba(255,255,255,0.6)" />
                </div>
              </div>
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, var(--card), transparent)`
                }}
              />
            </div>

            <div className="relative">
              <h3
                className="font-bold text-lg"
                style={{ color: 'var(--foreground)' }}
              >
                {t("team.professional")}
              </h3>
              <p
                className="text-sm mt-2"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {t("team.professionalDesc")}
              </p>

              <div
                className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  opacity: 0.9
                }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'white' }} />
                {t("team.professionalBadge")}
              </div>
            </div>
          </div>

          {/* Innovation Spirit Card */}
          <div
            className="rounded-2xl p-6 overflow-hidden relative group hover-lift"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="h-56 rounded-xl mb-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, var(--warning) 10%, var(--accent) 100%)`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <MolecularStructure color="rgba(255,255,255,0.6)" />
                </div>
              </div>
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, var(--card), transparent)`
                }}
              />
            </div>

            <div className="relative">
              <h3
                className="font-bold text-lg"
                style={{ color: 'var(--foreground)' }}
              >
                {t("team.innovation")}
              </h3>
              <p
                className="text-sm mt-2"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {t("team.innovationDesc")}
              </p>

              <div
                className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: 'var(--warning)',
                  color: 'white',
                  opacity: 0.9
                }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'white' }} />
                {t("team.innovationBadge")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
