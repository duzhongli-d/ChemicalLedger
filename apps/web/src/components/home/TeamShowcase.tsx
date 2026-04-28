"use client";
import { useTranslations } from "next-intl";

function DNAHelixAnimation() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* DNA double helix strands */}
      <path
        d="M30 10 Q60 30 90 10 Q60 30 30 50 Q60 70 90 50 Q60 70 30 90 Q60 110 90 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="animate-pulse opacity-60"
      />
      <path
        d="M90 10 Q60 30 30 10 Q60 30 90 50 Q60 70 30 50 Q60 70 90 90 Q60 110 30 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="animate-pulse opacity-60"
        style={{ animationDelay: "0.5s" }}
      />
      {/* Base pairs */}
      <line x1="42" y1="22" x2="78" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="42" y1="42" x2="78" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="42" y1="62" x2="78" y2="62" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="42" y1="82" x2="78" y2="82" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* Animated nodes */}
      <circle cx="30" cy="10" r="4" className="animate-pulse" fill="currentColor" opacity="0.5" />
      <circle cx="90" cy="10" r="4" className="animate-pulse" fill="currentColor" opacity="0.5" />
      <circle cx="30" cy="50" r="4" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ animationDelay: "0.3s" }} />
      <circle cx="90" cy="50" r="4" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ animationDelay: "0.3s" }} />
      <circle cx="30" cy="90" r="4" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ animationDelay: "0.6s" }} />
      <circle cx="90" cy="90" r="4" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ animationDelay: "0.6s" }} />
    </svg>
  );
}

function MolecularStructure() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Atoms as circles */}
      <circle cx="35" cy="35" r="10" className="animate-pulse" fill="currentColor" opacity="0.4" />
      <circle cx="85" cy="30" r="7" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ animationDelay: "0.4s" }} />
      <circle cx="60" cy="75" r="9" className="animate-pulse" fill="currentColor" opacity="0.45" style={{ animationDelay: "0.8s" }} />
      <circle cx="90" cy="70" r="6" className="animate-pulse" fill="currentColor" opacity="0.5" style={{ animationDelay: "1.2s" }} />
      <circle cx="25" cy="80" r="5" className="animate-pulse" fill="currentColor" opacity="0.4" style={{ animationDelay: "0.6s" }} />
      {/* Bonds as lines */}
      <line x1="35" y1="35" x2="85" y2="30" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <line x1="85" y1="30" x2="60" y2="75" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <line x1="60" y1="75" x2="90" y2="70" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <line x1="60" y1="75" x2="25" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <line x1="35" y1="35" x2="25" y2="80" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <line x1="85" y1="30" x2="90" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
    </svg>
  );
}

export function TeamShowcase() {
  const t = useTranslations("home");

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-[1320px] mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center font-mono">
          {t("team.title")}
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Professional Team Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-hidden relative group">
            <div className="h-56 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-xl mb-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 text-teal-600/40">
                  <DNAHelixAnimation />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
            </div>

            <div className="relative">
              <h3 className="font-bold text-gray-900 text-lg">{t("team.professional")}</h3>
              <p className="text-gray-600 text-sm mt-2">{t("team.professionalDesc")}</p>

              <div className="mt-4 inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-mono">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                {t("team.professionalBadge")}
              </div>
            </div>
          </div>

          {/* Innovation Spirit Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-hidden relative group">
            <div className="h-56 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl mb-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 text-orange-600/40">
                  <MolecularStructure />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
            </div>

            <div className="relative">
              <h3 className="font-bold text-gray-900 text-lg">{t("team.innovation")}</h3>
              <p className="text-gray-600 text-sm mt-2">{t("team.innovationDesc")}</p>

              <div className="mt-4 inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-mono">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                {t("team.innovationBadge")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
