"use client";
import { useEffect, useRef, useState } from "react";
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const rotateX = mousePosition.y * -12;
  const rotateY = mousePosition.x * 12;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="flex-shrink-0 w-[260px] sm:w-[280px] h-[180px] relative rounded-2xl overflow-hidden group transition-all duration-500 mx-3"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? 'scale(1.05)' : 'scale(1)'}`,
        transition: 'transform 0.15s ease-out, scale 0.3s ease',
      }}
    >
      {/* Background gradient - dark with orange accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.3) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      {/* Dynamic glow effect following mouse */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(249, 115, 22, 0.25) 0%, transparent 60%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 p-5 h-full flex flex-col justify-between"
        style={{
          transform: 'translateZ(30px)',
        }}
      >
        <div>
          <div className="text-2xl font-bold text-white mb-1 tracking-wide font-mono">{inst.name}</div>
          <div className="text-orange-400 font-mono text-[11px] opacity-80">{inst.model}</div>
        </div>
        <div className="space-y-1">
          <div className="text-white/70 text-xs leading-relaxed">{t("instruments." + inst.useKey)}</div>
          <div className="text-orange-400/60 text-[10px]">{t("instruments." + inst.appKey)}</div>
        </div>
      </div>

      {/* Bottom accent line - animated on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] transform origin-left transition-transform duration-500"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.8), transparent)',
          transform: `scaleX(${isHovered ? 1 : 0})`,
        }}
      />

      {/* Hover overlay with blur */}
      {isHovered && (
      <div
        className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-xl transition-all duration-300"
        style={{
          transform: `translateZ(${isHovered ? 0 : -30}px)`,
        }}
      >
        <div
          className="text-3xl font-bold text-white mb-2 font-mono"
          style={{ transform: isHovered ? 'translateY(0)' : 'translateY(10px)', transition: 'transform 0.3s ease 0.1s' }}
        >
          {inst.name}
        </div>
        <div
          className="text-orange-400 font-mono text-xs mb-4"
          style={{ transform: isHovered ? 'translateY(0)' : 'translateY(10px)', transition: 'transform 0.3s ease 0.15s' }}
        >
          {inst.model}
        </div>
        <div
          className="w-10 h-[2px] bg-gradient-to-r from-orange-500 to-transparent mb-4"
          style={{ transform: isHovered ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 0.3s ease 0.2s' }}
        />
        <div
          className="text-white/80 text-sm mb-1"
          style={{ transform: isHovered ? 'translateY(0)' : 'translateY(10px)', transition: 'transform 0.3s ease 0.25s' }}
        >
          {t("instruments." + inst.useKey)}
        </div>
        <div
          className="text-orange-400 text-xs"
          style={{ transform: isHovered ? 'translateY(0)' : 'translateY(10px)', transition: 'transform 0.3s ease 0.3s' }}
        >
          {t("instruments." + inst.appKey)}
        </div>
      </div>
      )}
    </div>
  );
}

export function InstrumentGallery() {
  const t = useTranslations("home");

  // Duplicate instruments for seamless infinite scroll
  const duplicatedInstruments = [...instruments, ...instruments];

  return (
    <section className="py-16 sm:py-20 bg-slate-900 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(249, 115, 22, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(249, 115, 22, 0.06) 0%, transparent 50%)'
        }}
      />

      {/* Animated gradient border at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-wide">
            {t("instruments.title")}
          </h2>
          <Link href="/ledgers" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors group">
            {t("instruments.viewAll")}
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Infinite scroll container */}
        <div className="relative overflow-hidden group">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 z-20 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-20 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />

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
          animation: scroll 40s linear infinite;
        }
        .group:hover .animate-scroll {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
