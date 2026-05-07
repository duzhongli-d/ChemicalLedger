"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";

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

interface Milestone {
  year: string;
  label: string;
}

export default function PlatformStoryTab() {
  const t = useTranslations();
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

  const milestones: Milestone[] = [
    {
      year: t("about.platformStory.milestones.establishedYear"),
      label: t("about.platformStory.milestones.established"),
    },
    {
      year: t("about.platformStory.milestones.gmpYear"),
      label: t("about.platformStory.milestones.gmpCertified"),
    },
    {
      year: t("about.platformStory.milestones.isoYear"),
      label: t("about.platformStory.milestones.isoCertified"),
    },
    {
      year: t("about.platformStory.milestones.cloudYear"),
      label: t("about.platformStory.milestones.cloudLaunch"),
    },
    {
      year: t("about.platformStory.milestones.aiYear"),
      label: t("about.platformStory.milestones.aiIntegration"),
    },
  ];

  return (
    <div ref={sectionRef} className="max-w-[1320px] mx-auto px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 right-12 w-28 h-28 text-orange-500/15 dark:text-orange-500/30 pointer-events-none">
        <MolecularStructure className="w-full h-full" />
      </div>
      <div className="absolute bottom-32 left-16 w-24 h-24 text-orange-500/20 dark:text-orange-500/40 pointer-events-none">
        <MolecularStructure className="w-full h-full" />
      </div>
      <div className="absolute bottom-20 right-20 w-36 h-36 text-orange-500/15 dark:text-orange-500/30 animate-pulse pointer-events-none">
        <DNAHelixAnimation className="w-full h-full" />
      </div>

      {/* Content container */}
      <div className="relative">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800 mb-6">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
            {t("about.platformStory.professionalBadge")}
          </span>
        </div>

        {/* Section Title */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("about.platformStory.title")}
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-300 dark:to-orange-700" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-300 dark:to-orange-700" />
          </div>
        </div>

        {/* Narrative Body */}
        <div
          className={`text-muted-foreground leading-relaxed space-y-4 mb-12 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p>{t("about.platformStory.body")}</p>
        </div>

        {/* Milestone Timeline Card */}
        <div
          className={`rounded-2xl border-border bg-card p-8 shadow-sm hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-8">
            {t("about.platformStory.milestones.title")}
          </h3>

          {/* Timeline */}
          <div className="relative">
            {/* Horizontal connecting line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted-foreground/20" />

            {/* Milestone dots and content */}
            <div className="relative flex justify-between">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex flex-col items-center">
                  {/* Dot */}
                  <div className="relative z-10 w-4 h-4 rounded-full bg-orange-500 border-4 border-white dark:border-[var(--card)] shadow" />

                  {/* Year */}
                  <span className="mt-3 text-sm font-mono font-semibold text-muted-foreground">
                    {milestone.year}
                  </span>

                  {/* Label */}
                  <span className="mt-1 text-xs text-muted-foreground text-center max-w-[100px] leading-tight">
                    {milestone.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}