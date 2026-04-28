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
    <div
      className="flex-shrink-0 w-[280px] h-[180px] relative rounded-2xl overflow-hidden group transition-all duration-300 mx-3 hover-lift"
      style={{ perspective: "1000px" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, var(--card) 0%, var(--muted) 100%)`
        }}
      />

      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at center, var(--accent) 0%, transparent 70%)`,
          opacity: 0.08
        }}
      />

      {/* Default state: name + model only */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between">
        <div>
          <div
            className="text-2xl font-bold mb-1 tracking-wide"
            style={{ fontFamily: "'Plus Jakarta Sans', monospace", color: 'var(--foreground)' }}
          >
            {inst.name}
          </div>
          <div
            className="font-mono text-[11px] opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            {inst.model}
          </div>
        </div>
        {/* Bottom accent line */}
        <div
          className="h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, var(--accent), transparent)`
          }}
        />
      </div>

      {/* Hover overlay - clean fade without movement */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center p-6 text-center"
        style={{
          background: 'var(--card)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', monospace", color: 'var(--foreground)' }}
        >
          {inst.name}
        </div>
        <div
          className="font-mono text-[11px] mb-3"
          style={{ color: 'var(--accent)' }}
        >
          {inst.model}
        </div>
        <div className="w-10 h-[2px] mb-3" style={{ background: 'var(--accent)' }} />
        <div className="text-sm mb-1" style={{ color: 'var(--foreground)' }}>
          {t("instruments." + inst.useKey)}
        </div>
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {t("instruments." + inst.appKey)}
        </div>
      </div>
    </div>
  );
}

export function InstrumentGallery() {
  const t = useTranslations("home");

  // Duplicate instruments for seamless infinite scroll
  const duplicatedInstruments = [...instruments, ...instruments];

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* Background glow effects */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, var(--accent) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, var(--primary) 0%, transparent 50%)`,
          opacity: 0.08
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "'DM Serif Display', serif",
              color: 'var(--foreground)'
            }}
          >
            {t("instruments.title")}
          </h2>
          <Link
            href="/ledgers"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover-lift"
            style={{ color: 'var(--accent)' }}
          >
            {t("instruments.viewAll")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Infinite scroll container */}
        <div className="relative overflow-hidden group">
          {/* Fade edges */}
          <div
            className="absolute left-0 top-0 bottom-0 w-20 z-20 pointer-events-none"
            style={{
              background: `linear-gradient(to right, var(--background), transparent)`
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-20 z-20 pointer-events-none"
            style={{
              background: `linear-gradient(to left, var(--background), transparent)`
            }}
          />

          {/* Scrolling track */}
          <div
            className="flex animate-scroll"
            style={{ width: 'fit-content' }}
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
