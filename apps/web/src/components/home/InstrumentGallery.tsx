"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Instrument {
  name: string;
  model: string;
  useKey: string;
  appKey: string;
}

const instruments: Instrument[] = [
  { name: "HPLC", model: "Waters Alliance e2695", useKey: "hplc.use", appKey: "hplc.application" },
  { name: "LC-MS", model: "Waters ACQUITY QDa", useKey: "lcms.use", appKey: "lcms.application" },
  { name: "GC-MS", model: "Shimadzu QP2020", useKey: "gcms.use", appKey: "gcms.application" },
  { name: "NMR", model: "Bruker AVANCE III 400MHz", useKey: "nmr.use", appKey: "nmr.application" },
  { name: "UV-Vis", model: "Agilent Cary 60", useKey: "uvvis.use", appKey: "uvvis.application" },
  { name: "IR", model: "Thermo Nicolet iS50", useKey: "ir.use", appKey: "ir.application" },
  { name: "AAS", model: "PerkinElmer AAnalyst 200", useKey: "aas.use", appKey: "aas.application" },
  { name: "Titrator", model: "Mettler Toledo G20", useKey: "titrator.use", appKey: "titrator.application" },
  { name: "KF", model: "Metrohm 870 Titrino plus", useKey: "kf.use", appKey: "kf.application" },
  { name: "MP", model: "Stanford Research Systems", useKey: "mp.use", appKey: "mp.application" },
  { name: "Polarimeter", model: "Rudolph Autopol IV", useKey: "polarimeter.use", appKey: "polarimeter.application" },
  { name: "GC", model: "Shimadzu GC-2030", useKey: "gc.use", appKey: "gc.application" },
  { name: "TLC", model: "CAMAG TLC Visualizer", useKey: "tlc.use", appKey: "tlc.application" },
  { name: "EA", model: "Elementar Vario EL Cube", useKey: "ea.use", appKey: "ea.application" },
];

function InstrumentCard({ inst, t }: { inst: Instrument; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex-shrink-0 w-[280px] h-[180px] relative rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-105 mx-3"
      style={{ perspective: "1000px" }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: 'linear-gradient(rgba(20, 184, 166, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.3) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(20, 184, 166, 0.15) 0%, transparent 70%)'
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold text-white mb-1 tracking-wide font-mono">{inst.name}</div>
          <div className="text-teal-400 font-mono text-[11px] opacity-80">{inst.model}</div>
        </div>
        <div className="space-y-1">
          <div className="text-white/70 text-xs leading-relaxed">{t("instruments." + inst.useKey)}</div>
          <div className="text-teal-400/60 text-[10px]">{t("instruments." + inst.appKey)}</div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
        <div className="text-3xl font-bold text-white mb-2 font-mono">{inst.name}</div>
        <div className="text-teal-400 font-mono text-xs mb-4">{inst.model}</div>
        <div className="w-10 h-[2px] bg-gradient-to-r from-teal-500 to-transparent mb-4"></div>
        <div className="text-white/80 text-sm mb-1">{t("instruments." + inst.useKey)}</div>
        <div className="text-teal-400 text-xs">{t("instruments." + inst.appKey)}</div>
      </div>
    </div>
  );
}

export function InstrumentGallery() {
  const t = useTranslations("home");

  // Duplicate instruments for seamless infinite scroll
  const duplicatedInstruments = [...instruments, ...instruments];

  return (
    <section className="py-20 bg-slate-900 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(20, 184, 166, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)'
        }}
      ></div>

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white font-mono tracking-wide">
            {t("instruments.title")}
          </h2>
          <Link href="/ledgers" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors">
            {t("instruments.viewAll")}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Infinite scroll container */}
        <div className="relative overflow-hidden group">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 z-20 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 z-20 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none"></div>

          {/* Scrolling track */}
          <div
            className="flex animate-scroll"
            style={{
              width: 'fit-content',
            }}
          >
            {duplicatedInstruments.map((inst, idx) => (
              <InstrumentCard key={`${inst.name}-${idx}`} inst={inst} t={t} />
            ))}
          </div>
        </div>
      </div>

      {/* CSS for infinite scroll animation */}
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 35s linear infinite;
        }
        .group:hover .animate-scroll {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
