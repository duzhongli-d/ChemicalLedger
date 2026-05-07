"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";

// DNA Helix Animation Component
function DNAHelixAnimation({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <path
        d="M30 10 Q60 30 90 10 Q60 30 30 50 Q60 70 90 50 Q60 70 30 90 Q60 110 90 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M90 10 Q60 30 30 10 Q60 30 90 50 Q60 70 30 50 Q60 70 90 90 Q60 110 30 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line x1="42" y1="22" x2="78" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="42" y1="42" x2="78" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="42" y1="62" x2="78" y2="62" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="42" y1="82" x2="78" y2="82" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="30" cy="10" r="4" fill="currentColor" opacity="0.6" />
      <circle cx="90" cy="30" r="3.5" fill="currentColor" opacity="0.6" />
      <circle cx="30" cy="50" r="4" fill="currentColor" opacity="0.6" />
      <circle cx="90" cy="50" r="3.5" fill="currentColor" opacity="0.6" />
      <circle cx="30" cy="90" r="4" fill="currentColor" opacity="0.6" />
      <circle cx="90" cy="70" r="3.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

// Molecular Structure Component
function MolecularStructure({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <circle cx="35" cy="35" r="10" fill="currentColor" opacity="0.5" />
      <circle cx="85" cy="30" r="7" fill="currentColor" opacity="0.5" />
      <circle cx="60" cy="75" r="9" fill="currentColor" opacity="0.5" />
      <circle cx="90" cy="70" r="6" fill="currentColor" opacity="0.5" />
      <circle cx="25" cy="80" r="5" fill="currentColor" opacity="0.5" />
      <line x1="35" y1="35" x2="85" y2="30" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <line x1="85" y1="30" x2="60" y2="75" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <line x1="60" y1="75" x2="90" y2="70" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <line x1="60" y1="75" x2="25" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <line x1="35" y1="35" x2="25" y2="80" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <line x1="85" y1="30" x2="90" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
    </svg>
  );
}

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
    <div className="flex-shrink-0 w-[260px] sm:w-[280px] h-[180px] relative rounded-2xl overflow-hidden group transition-all duration-300 bg-card border-border hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-[1.02]">
      {/* Dot grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(249, 115, 22, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
      {/* Content */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between items-center text-center">
        <div>
          <div className="text-2xl font-bold text-foreground mb-1 tracking-wide font-mono">{inst.name}</div>
          <div className="text-orange-500 dark:text-orange-400 font-mono text-xs">{inst.model}</div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm leading-relaxed">QC Analysis</div>
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
      <div className="text-4xl sm:text-5xl font-bold text-foreground font-mono tracking-tight">
        <AnimatedNumber value={value} suffix={suffix} isVisible={isVisible} />
      </div>
      <div className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">{label}</div>
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
    <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border-border hover:border-orange-200 hover:bg-card/80 transition-all duration-300">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
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
    <div ref={sectionRef} className="max-w-[1320px] mx-auto px-4 py-12 relative overflow-hidden">
      {/* Content container */}
      <div className="relative">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800 mb-6">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
            {t("technicalCapabilities.professionalBadge")}
          </span>
        </div>

        {/* Section Title */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("technicalCapabilities.title")}
          </h2>
        </div>

        {/* Instrument Grid Section */}
        <section className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-300 dark:to-orange-700" />
            <h3 className="text-xl sm:text-2xl font-bold text-foreground font-mono tracking-wide text-center">
              Equipment
            </h3>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-300 dark:to-orange-700" />
          </div>
          <p className="text-muted-foreground leading-relaxed mb-8 text-center">
            {t("technicalCapabilities.instrumentsIntro")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {instruments.map((inst, idx) => (
              <InstrumentCard key={`${inst.name}-${idx}`} inst={inst} />
            ))}
          </div>
        </section>

        {/* Tech Metrics Section */}
        <section className="py-8 px-6 rounded-2xl bg-gradient-to-br from-muted to-teal-50/30 border-border mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <TechMetric value={14} suffix="+" label="Analytical Instruments" isVisible={isVisible} />
            <TechMetric value={99.9} suffix="%" label="Instrument Uptime" isVisible={isVisible} />
            <TechMetric value={15} suffix="+" label="Years Combined Experience" isVisible={isVisible} />
            <TechMetric value={1000} suffix="+" label="Methods Validated" isVisible={isVisible} />
          </div>
        </section>

        {/* Platform Technology Highlights */}
        <section className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-300 dark:to-orange-700" />
            <h3 className="text-xl sm:text-2xl font-bold text-foreground font-mono tracking-wide text-center">
              Platform Technology
            </h3>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-300 dark:to-orange-700" />
          </div>
        <p className="text-muted-foreground leading-relaxed mb-6">
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
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-300 dark:to-orange-700" />
          <h3 className="text-xl sm:text-2xl font-bold text-foreground font-mono tracking-wide text-center">
            {t("technicalCapabilities.categories.title")}
          </h3>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-300 dark:to-orange-700" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 rounded-xl bg-card border-border hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300">
            <div className="text-2xl mb-2">🔬</div>
            <div className="text-sm font-medium text-muted-foreground">{t("technicalCapabilities.categories.identification")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border-border hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300">
            <div className="text-2xl mb-2">⚗️</div>
            <div className="text-sm font-medium text-muted-foreground">{t("technicalCapabilities.categories.purity")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border-border hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-medium text-muted-foreground">{t("technicalCapabilities.categories.impurity")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border-border hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium text-muted-foreground">{t("technicalCapabilities.categories.content")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border-border hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300">
            <div className="text-2xl mb-2">⏱️</div>
            <div className="text-sm font-medium text-muted-foreground">{t("technicalCapabilities.categories.dissolution")}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border-border hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-sm font-medium text-muted-foreground">{t("technicalCapabilities.categories.stability")}</div>
          </div>
        </div>
      </section>
      </div>{/* close relative */}
    </div>
  );
}
