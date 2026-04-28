"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const instruments = [
  { name: "HPLC", model: "Waters Alliance e2695", use: "API纯度分析", specs: [{ label: "λ", value: "UV-Vis Detector" }, { label: "P", value: "1500 bar" }] },
  { name: "LC-MS", model: "Waters ACQUITY QDa", use: "痕量杂质鉴定" },
  { name: "GC-MS", model: "Shimadzu QP2020", use: "溶剂残留检测" },
  { name: "NMR", model: "Bruker AVANCE III 400MHz", use: "结构确证" },
  { name: "UV-Vis", model: "Agilent Cary 60", use: "含量测定" },
  { name: "IR", model: "Thermo Nicolet iS50", use: "官能团鉴定" },
];

function SmallCard({ inst }: { inst: typeof instruments[0] }) {
  return (
    <div className="relative rounded-2xl overflow-hidden group bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        <div>
          <div className="text-3xl font-bold text-white mb-1">{inst.name}</div>
          <div className="text-teal-400 font-mono text-xs">{inst.model}</div>
        </div>
        <div className="text-white/80 text-sm">{inst.use}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
}

function LargeHPLCCard({ inst }: { inst: typeof instruments[0] }) {
  return (
    <div className="relative col-span-2 row-span-2 rounded-2xl overflow-hidden group">
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
          <div className="text-white/80 text-sm">{inst.use}</div>
          <div className="flex gap-4">
            {inst.specs?.map((spec) => (
              <div key={spec.label} className="text-white/60 text-xs">
                <span className="text-teal-400">{spec.label}</span> {spec.value}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
}

export function InstrumentGallery() {
  const t = useTranslations("home");

  const hplc = instruments[0];
  const uvVis = instruments[5];
  const ir = instruments[4];
  const nmr = instruments[3];
  const gcMs = instruments[2];
  const lcMs = instruments[1];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 font-mono">{t("instruments.title")}</h2>

        <div className="grid grid-cols-4 gap-4 auto-rows-[200px]">
          <LargeHPLCCard inst={hplc} />

          <div className="relative rounded-2xl overflow-hidden group bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{uvVis.name}</div>
                <div className="text-teal-400 font-mono text-xs">{uvVis.model}</div>
              </div>
              <div className="text-white/80 text-sm">{uvVis.use}</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          <div className="relative rounded-2xl overflow-hidden group bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{ir.name}</div>
                <div className="text-teal-400 font-mono text-xs">{ir.model}</div>
              </div>
              <div className="text-white/80 text-sm">{ir.use}</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          <SmallCard inst={nmr} />
          <SmallCard inst={gcMs} />
          <SmallCard inst={lcMs} />
        </div>

        <div className="mt-8 text-center">
          <Link href="/ledgers" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium">
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
