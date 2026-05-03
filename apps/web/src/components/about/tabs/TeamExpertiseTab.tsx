"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";

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

// Animated Counter Hook
function useAnimatedCounter(
  endValue: number,
  duration: number = 2000,
  startOnMount: boolean = true
) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startOnMount && !hasStarted) return;

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeOut * endValue));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [endValue, duration, startOnMount, hasStarted]);

  const start = () => setHasStarted(true);

  return { count, start };
}

// Department Card Component
interface DepartmentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}

function DepartmentCard({ title, description, icon, index }: DepartmentCardProps) {
  return (
    <div
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5 group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  value: string;
  label: string;
  subtext?: string;
  highlight?: boolean;
}

function StatCard({ value, label, subtext, highlight }: StatCardProps) {
  return (
    <div
      className={`relative bg-slate-800/50 backdrop-blur-sm border rounded-xl p-6 text-center ${
        highlight
          ? "border-orange-500/50 shadow-lg shadow-orange-500/10"
          : "border-slate-700/50"
      }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-xs font-semibold text-white shadow-lg">
          Key Metric
        </div>
      )}
      <div className={`text-4xl font-bold mb-2 ${highlight ? "text-orange-400" : "text-white"}`}>
        {value}
      </div>
      <div className="text-sm text-slate-300 font-medium">{label}</div>
      {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
    </div>
  );
}

export default function TeamExpertiseTab() {
  const t = useTranslations();
  const { count: animatedPercent, start: startCounter } = useAnimatedCounter(60, 2000, false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          startCounter();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [startCounter]);

  const departments = [
    {
      key: "chemistry",
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L3.2 15.3" />
        </svg>
      ),
    },
    {
      key: "instrumental",
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L3.2 15.3M3.2 15.3A9.065 9.065 0 0112 15c1.162 0 2.24.196 3.195.552" />
        </svg>
      ),
    },
    {
      key: "microbiology",
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
        </svg>
      ),
    },
    {
      key: "quality",
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      key: "regulatory",
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
  ];

  return (
    <div ref={sectionRef} className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-20 left-8 w-32 h-32 text-orange-500/20 animate-pulse">
        <DNAHelixAnimation className="w-full h-full" />
      </div>
      <div className="absolute top-40 right-12 w-28 h-28 text-orange-500/15">
        <MolecularStructure className="w-full h-full" />
      </div>
      <div className="absolute bottom-32 left-16 w-24 h-24 text-orange-500/20">
        <MolecularStructure className="w-full h-full" />
      </div>
      <div className="absolute bottom-20 right-20 w-36 h-36 text-orange-500/15 animate-pulse">
        <DNAHelixAnimation className="w-full h-full" />
      </div>

      {/* Content container */}
      <div className="relative max-w-6xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-medium text-orange-400">
              {t("about.team.professionalBadge")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("about.team.title")}
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t("about.team.intro")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <StatCard
            value={`${isVisible ? animatedPercent : 0}%+`}
            label="Masters/PhDs"
            subtext="of team composition"
            highlight={true}
          />
          <StatCard
            value="8+"
            label="Years Avg Experience"
            subtext="Industry expertise"
          />
          <StatCard
            value="100%"
            label="Compliance Rate"
            subtext="Across all audits"
          />
        </div>

        {/* Department Structure Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-500/50" />
            <h3 className="text-2xl font-bold text-white text-center">
              {t("about.team.deptStructure.title")}
            </h3>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-500/50" />
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept, index) => (
              <DepartmentCard
                key={dept.key}
                title={t(`about.team.deptStructure.${dept.key}`)}
                description={t(`about.team.deptStructure.${dept.key}Desc`)}
                icon={dept.icon}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Additional Team Info */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/40 flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.227 3.375 3.375 0 014.438-4.982l1.653-1.653a9.337 9.337 0 002.625-.372 3.375 3.375 0 00-4.438-4.982l-1.653-1.653a9.337 9.337 0 00-2.625-.372 9.337 9.337 0 00-4.121.227 3.375 3.375 0 01-4.438 4.982L2.686 13.06a9.337 9.337 0 00.372 2.625 3.375 3.375 0 01-4.982 4.438l1.653 1.653a9.337 9.337 0 00.372 2.625 9.337 9.337 0 004.121-.227 3.375 3.375 0 014.438 4.982l1.653 1.653a9.337 9.337 0 002.625-.372 3.375 3.375 0 014.982-4.982l1.653-1.653a9.337 9.337 0 00.372-2.625 3.375 3.375 0 014.982-4.982l1.653-1.653a9.337 9.337 0 00-.372-2.625 3.375 3.375 0 014.982-4.982l1.653-1.653a9.337 9.337 0 00.372-2.625 3.375 3.375 0 01-4.982-4.438z" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-xl font-semibold text-white mb-2">
                Professional Certifications
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Our team members hold certifications including ISO 17025 Assessor,
                GMP Practitioner, and ICH Guideline Training, ensuring the highest
                standards in quality control operations and regulatory compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}