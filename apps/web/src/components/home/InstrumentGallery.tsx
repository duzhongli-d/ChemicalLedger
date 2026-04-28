"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const instruments = [
  { name: "HPLC", model: "Waters Alliance e2695", useKey: "hplc.use", specs: [{ label: "λ", value: "UV-Vis Detector" }, { label: "P", value: "1500 bar" }], appKey: "hplc.application" },
  { name: "LC-MS", model: "Waters ACQUITY QDa", useKey: "lcms.use", appKey: "lcms.application" },
  { name: "GC-MS", model: "Shimadzu QP2020", useKey: "gcms.use", appKey: "gcms.application" },
  { name: "NMR", model: "Bruker AVANCE III 400MHz", useKey: "nmr.use", appKey: "nmr.application" },
  { name: "UV-Vis", model: "Agilent Cary 60", useKey: "uvvis.use", appKey: "uvvis.application" },
  { name: "IR", model: "Thermo Nicolet iS50", useKey: "ir.use", appKey: "ir.application" },
];

function SmallCard({ inst, t }: { inst: typeof instruments[0]; t: ReturnType<typeof useTranslations>; }) {
  return (
    <div className="relative rounded-2xl overflow-hidden group bg-gradient-to-br from-slate-800 to-slate-900 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10"
      style={{ transformStyle: "preserve-3d" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "perspective(1000px) rotateY(5deg) rotateX(5deg) scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)";
      }}
    >
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        <div>
          <div className="text-3xl font-bold text-white mb-1">{inst.name}</div>
          <div className="text-teal-400 font-mono text-xs">{inst.model}</div>
        </div>
        <div className="text-white/80 text-sm">{t("instruments." + inst.useKey)}</div>
      </div>
      {/* Tooltip overlay */}
      <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center p-4 text-center">
        <p className="text-sm text-slate-300">{inst.model}</p>
        <p className="text-xs text-teal-400 mt-2">{t("instruments." + inst.appKey)}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
}

function LargeHPLCCard({ inst, t }: { inst: typeof instruments[0]; t: ReturnType<typeof useTranslations>; }) {
  return (
    <div className="relative col-span-2 row-span-2 rounded-2xl overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10"
      style={{ transformStyle: "preserve-3d" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "perspective(1000px) rotateY(5deg) rotateX(5deg) scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)";
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>
      <div className="relative z-10 p-8 h-full flex flex-col justify-between">
        <div>
          <div className="text-6xl font-bold text-white mb-2">{inst.name}</div>
          <div className="text-teal-400 font-mono text-sm">{inst.model}</div>
        </div>
        <div className="space-y-2">
          <div className="text-white/80 text-sm">{t("instruments." + inst.useKey)}</div>
          <div className="flex gap-4">
            {inst.specs?.map((spec) => (
              <div key={spec.label} className="text-white/60 text-xs">
                <span className="text-teal-400">{spec.label}</span> {spec.value}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Tooltip overlay */}
      <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center p-4 text-center">
        <p className="text-sm text-slate-300">{inst.model}</p>
        <p className="text-xs text-teal-400 mt-2">{t("instruments." + inst.appKey)}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
}

export function InstrumentGallery() {
  const t = useTranslations("home");

  const hplc = instruments[0];
  const uvVis = instruments[4];
  const ir = instruments[5];
  const nmr = instruments[3];
  const gcMs = instruments[2];
  const lcMs = instruments[1];

  return (
    <section className="py-20 bg-white dark:bg-slate-900 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 font-mono">{t("instruments.title")}</h2>

        <div className="grid grid-cols-4 gap-4 auto-rows-[200px]">
          <LargeHPLCCard inst={hplc} t={t} />

          <div className="relative rounded-2xl overflow-hidden group bg-gradient-to-br from-slate-800 to-slate-900 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10"
            style={{ transformStyle: "preserve-3d" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "perspective(1000px) rotateY(5deg) rotateX(5deg) scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)";
            }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{uvVis.name}</div>
                <div className="text-teal-400 font-mono text-xs">{uvVis.model}</div>
              </div>
              <div className="text-white/80 text-sm">{t("instruments.uvvis.use")}</div>
            </div>
            {/* Tooltip */}
            <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center p-4 text-center">
              <p className="text-sm text-slate-300">{uvVis.model}</p>
              <p className="text-xs text-teal-400 mt-2">{t("instruments.uvvis.application")}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          <div className="relative rounded-2xl overflow-hidden group bg-gradient-to-br from-slate-800 to-slate-900 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10"
            style={{ transformStyle: "preserve-3d" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "perspective(1000px) rotateY(5deg) rotateX(5deg) scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)";
            }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{ir.name}</div>
                <div className="text-teal-400 font-mono text-xs">{ir.model}</div>
              </div>
              <div className="text-white/80 text-sm">{t("instruments.ir.use")}</div>
            </div>
            {/* Tooltip */}
            <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center p-4 text-center">
              <p className="text-sm text-slate-300">{ir.model}</p>
              <p className="text-xs text-teal-400 mt-2">{t("instruments.ir.application")}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          <SmallCard inst={nmr} t={t} />
          <SmallCard inst={gcMs} t={t} />
          <SmallCard inst={lcMs} t={t} />
        </div>

        <div className="mt-8 text-center">
          <Link href="/ledgers" className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            {t("instruments.viewAll")}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
