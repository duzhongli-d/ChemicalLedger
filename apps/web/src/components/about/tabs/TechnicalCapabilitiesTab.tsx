"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";

interface Instrument {
  name: string;
  model: string;
  useKey: string;
  appKey: string;
}

const instruments: Instrument[] = [
  { name: "HPLC Systems", model: "High Performance Liquid Chromatography", useKey: "hplc.use", appKey: "hplc.application" },
  { name: "LC-MS/MS", model: "Liquid Chromatography-Tandem Mass Spectrometry", useKey: "lcms.use", appKey: "lcms.application" },
  { name: "GC-MS", model: "Gas Chromatography-Mass Spectrometry", useKey: "gcms.use", appKey: "gcms.application" },
  { name: "NMR Spectrometer", model: "Nuclear Magnetic Resonance", useKey: "nmr.use", appKey: "nmr.application" },
  { name: "AAS", model: "Atomic Absorption Spectrometer", useKey: "aas.use", appKey: "aas.application" },
  { name: "ICP-MS", model: "Inductively Coupled Plasma Mass Spectrometry", useKey: "icpms.use", appKey: "icpms.application" },
  { name: "UV-Vis Spectrophotometer", model: "Ultraviolet-Visible Spectroscopy", useKey: "uvvis.use", appKey: "uvvis.application" },
  { name: "FTIR Spectrometer", model: "Fourier Transform Infrared", useKey: "ftir.use", appKey: "ftir.application" },
  { name: "Automated Titrator", model: "Automated Titration System", useKey: "titrator.use", appKey: "titrator.application" },
  { name: "Particle Size Analyzer", model: "Dynamic Light Scattering", useKey: "psa.use", appKey: "psa.application" },
  { name: "Moisture Analyzer", model: "Karl Fischer Titration", useKey: "moisture.use", appKey: "moisture.application" },
  { name: "Polarimeter", model: "Optical Rotation Measurement", useKey: "polarimeter.use", appKey: "polarimeter.application" },
  { name: "Refractometer", model: "Refractive Index Analysis", useKey: "refractometer.use", appKey: "refractometer.application" },
  { name: "HPLC Columns", model: "Specialty Chromatography Columns", useKey: "hplccolumns.use", appKey: "hplccolumns.application" },
];

interface AnimatedNumberProps {
  value: number;
  suffix: string;
  isVisible: boolean;
}

function AnimatedNumber({ value, suffix, isVisible }: AnimatedNumberProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, isVisible]);

  const displayValue = value % 1 === 0 ? count.toLocaleString() : count.toFixed(1);
  return <span>{displayValue}{suffix}</span>;
}

interface InstrumentCardProps {
  inst: Instrument;
}

function InstrumentCard({ inst }: InstrumentCardProps) {
  return (
    <div className="flex-shrink-0 w-[260px] sm:w-[280px] h-[180px] relative rounded-2xl overflow-hidden group transition-all duration-300 bg-white border border-slate-200 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-[1.02]">
      {/* Dot grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(249, 115, 22, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
      {/* Content */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between items-center text-center">
        <div>
          <div className="text-2xl font-bold text-slate-800 mb-1 tracking-wide font-mono">{inst.name}</div>
          <div className="text-orange-500 font-mono text-xs">{inst.model}</div>
        </div>
        <div className="space-y-1">
          <div className="text-slate-500 text-sm leading-relaxed">QC Analysis</div>
          <div className="text-teal-500/80 text-xs">Chemical Testing</div>
        </div>
      </div>
    </div>
  );
}

interface TechMetricProps {
  value: number;
  suffix: string;
  label: string;
  isVisible: boolean;
}

function TechMetric({ value, suffix, label, isVisible }: TechMetricProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-4xl sm:text-5xl font-bold text-slate-800 font-mono tracking-tight">
        <AnimatedNumber value={value} suffix={suffix} isVisible={isVisible} />
      </div>
      <div className="text-sm sm:text-base text-slate-500 mt-2 leading-relaxed">{label}</div>
    </div>
  );
}

interface TechHighlightProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function TechHighlight({ title, description, icon }: TechHighlightProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 border border-slate-100 hover:border-orange-200 hover:bg-white/80 transition-all duration-300">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-semibold text-slate-800 mb-1">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function TechnicalCapabilitiesTab() {
  const t = useTranslations("about");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
    <div ref={sectionRef} className="space-y-12">
      {/* Instrument Grid Section */}
      <section>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-mono tracking-wide mb-6">
          {t("technicalCapabilities.title")}
        </h3>
        <p className="text-slate-500 leading-relaxed mb-8">
          {t("technicalCapabilities.instrumentsIntro")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {instruments.map((inst, idx) => (
            <InstrumentCard key={`${inst.name}-${idx}`} inst={inst} />
          ))}
        </div>
      </section>

      {/* Tech Metrics Section */}
      <section className="py-8 px-6 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <TechMetric value={14} suffix="+" label="Analytical Instruments" isVisible={isVisible} />
          <TechMetric value={99.9} suffix="%" label="Instrument Uptime" isVisible={isVisible} />
          <TechMetric value={15} suffix="+" label="Years Combined Experience" isVisible={isVisible} />
          <TechMetric value={1000} suffix="+" label="Methods Validated" isVisible={isVisible} />
        </div>
      </section>

      {/* Platform Technology Highlights */}
      <section>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-mono tracking-wide mb-6">
          Platform Technology
        </h3>
        <p className="text-slate-500 leading-relaxed mb-6">
          {t("technicalCapabilities.techIntro")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TechHighlight
            title="OCR Data Extraction"
            description="Automated capture of instrument readings and certificate data using advanced optical character recognition"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <TechHighlight
            title="Expiry Alert System"
            description="Real-time tracking of reagent and reference standard expiration dates with proactive notification"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <TechHighlight
            title="Advanced Analytics"
            description="Comprehensive data analytics with trend analysis, out-of-spec detection, and regulatory reporting"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <TechHighlight
            title="Method Validation"
            description="Built-in ICH Q2(R1) compliant method validation templates and documentation workflows"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <TechHighlight
            title="Audit Trail"
            description="Complete electronic audit trail with timestamped actions for regulatory compliance and traceability"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />
          <TechHighlight
            title="Cloud Integration"
            description="Secure cloud-based data storage with real-time synchronization across laboratory workstations"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Analysis Categories */}
      <section>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-mono tracking-wide mb-6">
          {t("technicalCapabilities.categories.title")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 rounded-xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all duration-300">
            <div className="text-2xl mb-2">🔬</div>
            <div className="text-sm font-medium text-slate-700">{t("technicalCapabilities.categories.identification")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all duration-300">
            <div className="text-2xl mb-2">⚗️</div>
            <div className="text-sm font-medium text-slate-700">{t("technicalCapabilities.categories.purity")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all duration-300">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-medium text-slate-700">{t("technicalCapabilities.categories.impurity")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all duration-300">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium text-slate-700">{t("technicalCapabilities.categories.content")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all duration-300">
            <div className="text-2xl mb-2">⏱️</div>
            <div className="text-sm font-medium text-slate-700">{t("technicalCapabilities.categories.dissolution")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all duration-300">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-sm font-medium text-slate-700">{t("technicalCapabilities.categories.stability")}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
