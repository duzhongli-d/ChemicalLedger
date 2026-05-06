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

interface InstrumentCardProps {
  inst: Instrument;
  t: ReturnType<typeof useTranslations>;
}

function InstrumentCard({ inst, t }: InstrumentCardProps) {
  return (
    <div className="flex-shrink-0 w-[260px] sm:w-[280px] h-[180px] relative rounded-2xl overflow-hidden group transition-all duration-300 mx-3 bg-white border border-slate-200 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-[1.02]">
      {/* Subtle dot grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(249, 115, 22, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-teal-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between items-center text-center">
        <div>
          <div className="text-2xl font-bold text-slate-800 mb-1 tracking-wide font-mono">{inst.name}</div>
          <div className="text-orange-500 font-mono text-xs">{inst.model}</div>
        </div>
        <div className="space-y-1">
          <div className="text-slate-500 text-sm leading-relaxed">{t("instruments." + inst.useKey)}</div>
          <div className="text-teal-500/80 text-xs">{t("instruments." + inst.appKey)}</div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-teal-500 to-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </div>
  );
}

export function InstrumentGallery() {
  const t = useTranslations("home");

  // Duplicate instruments for seamless infinite scroll
  const duplicatedInstruments = [...instruments, ...instruments];

  return (
    <section className="py-16 sm:py-20 bg-secondary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dot-grid opacity-30" />

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground font-mono tracking-wide">
            {t("instruments.title")}
          </h2>
          <Link href="/about?tab=technical" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors group">
            {t("instruments.viewAll")}
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Infinite scroll container */}
        <div className="relative overflow-hidden group">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 z-20 bg-gradient-to-r from-secondary to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-20 bg-gradient-to-l from-secondary to-transparent pointer-events-none" />

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
          animation: scroll 80s linear infinite;
        }
        .group:hover .animate-scroll {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
