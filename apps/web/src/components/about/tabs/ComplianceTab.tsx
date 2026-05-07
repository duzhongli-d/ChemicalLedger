"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";

interface Certification {
  name: string;
  issueDate: string;
  scope: string;
  status: "active" | "expired" | "pending";
}

function AnimatedCounter({ value, suffix, isVisible }: { value: number; suffix: string; isVisible: boolean }) {
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
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, isVisible]);

  const displayValue = value % 1 === 0 ? count.toLocaleString() : count.toFixed(1);
  return <span>{displayValue}{suffix}</span>;
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AwardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export default function ComplianceTab() {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [mounted]);

  const certifications: Certification[] = [
    {
      name: t("about.compliance.certificationsList.iso17025"),
      issueDate: "2022-03-15",
      scope: t("about.compliance.certificationsList.scopeTesting"),
      status: "active",
    },
    {
      name: t("about.compliance.certificationsList.gmp"),
      issueDate: "2021-06-20",
      scope: t("about.compliance.certificationsList.scopeManufacturing"),
      status: "active",
    },
    {
      name: t("about.compliance.certificationsList.iso9001"),
      issueDate: "2020-09-10",
      scope: t("about.compliance.certificationsList.scopeQuality"),
      status: "active",
    },
    {
      name: t("about.compliance.certificationsList.glp"),
      issueDate: "2023-01-08",
      scope: t("about.compliance.certificationsList.scopeLaboratory"),
      status: "active",
    },
  ];

  const getStatusBadge = (status: Certification["status"]) => {
    const badges = {
      active: {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-800",
        label: t("about.compliance.statusActive"),
      },
      expired: {
        bg: "bg-red-50 dark:bg-red-950/30",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
        label: t("about.compliance.statusExpired"),
      },
      pending: {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800",
        label: t("about.compliance.statusPending"),
      },
    };
    const badge = badges[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  const getCertificationIcon = (name: string) => {
    if (name.toLowerCase().includes("iso 17025") || name.toLowerCase().includes("iso 9001")) {
      return <AwardIcon className="w-8 h-8 text-teal-600" />;
    }
    if (name.toLowerCase().includes("gmp")) {
      return <ShieldIcon className="w-8 h-8 text-orange-500" />;
    }
    return <CheckCircleIcon className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div ref={sectionRef} className="max-w-[1320px] mx-auto px-4 py-12">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800 mb-6">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
          {t("about.compliance.professionalBadge")}
        </span>
      </div>

      {/* Section Title */}
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {t("about.compliance.title")}
        </h2>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-300 dark:to-orange-700" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-300 dark:to-orange-700" />
        </div>
      </div>

      {/* GMP/ISO Certification Cards */}
      <div
        className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* ISO 17025 Card */}
        <div className="bg-card rounded-2xl border-border p-6 shadow-sm hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
              <AwardIcon className="w-8 h-8 text-teal-600" />
            </div>
            {getStatusBadge("active")}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">ISO 17025:2017</h3>
          <p className="text-sm text-muted-foreground mb-3">{t("about.compliance.cardTestingLab")}</p>
          <div className="text-xs text-muted-foreground font-mono">
            {t("about.compliance.cardAccredited")}
          </div>
        </div>

        {/* GMP Card */}
        <div
          className={`bg-card rounded-2xl border-border p-6 shadow-sm hover:border-orange-400/50 transition-colors transition-delay-100 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
              <ShieldIcon className="w-8 h-8 text-orange-500" />
            </div>
            {getStatusBadge("active")}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{t("about.compliance.gmpLabel")}</h3>
          <p className="text-sm text-muted-foreground mb-3">{t("about.compliance.cardGoodPractices")}</p>
          <div className="text-xs text-muted-foreground font-mono">
            {t("about.compliance.cardVerified2021")}
          </div>
        </div>

        {/* ISO 9001 Card */}
        <div
          className={`bg-card rounded-2xl border-border p-6 shadow-sm hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 transition-delay-200 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <AwardIcon className="w-8 h-8 text-blue-600" />
            </div>
            {getStatusBadge("active")}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">ISO 9001:2015</h3>
          <p className="text-sm text-muted-foreground mb-3">{t("about.compliance.cardQualityMgmt")}</p>
          <div className="text-xs text-muted-foreground font-mono">
            {t("about.compliance.cardCertified2020")}
          </div>
        </div>

        {/* GLP Card */}
        <div
          className={`bg-card rounded-2xl border-border p-6 shadow-sm hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 transition-delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8 text-purple-500" />
            </div>
            {getStatusBadge("active")}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{t("about.compliance.glpLabel")}</h3>
          <p className="text-sm text-muted-foreground mb-3">{t("about.compliance.cardLabPractice")}</p>
          <div className="text-xs text-muted-foreground font-mono">
            {t("about.compliance.cardCertified2023")}
          </div>
        </div>
      </div>

      {/* Audit Rate Highlight */}
      <div
        className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-12 relative overflow-hidden transition-all duration-700 delay-400 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-[60px]" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <ShieldIcon className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">
                {t("about.compliance.auditRateHighlight")}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {t("about.compliance.auditRate")}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {t("about.compliance.auditRateDesc")}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-bold font-mono text-orange-400">
                <AnimatedCounter value={99.8} suffix="%" isVisible={isVisible} />
              </div>
              <div className="text-muted-foreground mt-2 uppercase tracking-wider">
                {t("about.compliance.auditPassRate")}
              </div>
            </div>

            <div className="w-px h-16 bg-muted-foreground/30" />

            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-white">
                3+
              </div>
              <div className="text-muted-foreground mt-2 uppercase tracking-wider">
                {t("about.compliance.consecutiveYears")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certification List Table */}
      <div
        className={`bg-card rounded-2xl border-border shadow-sm overflow-hidden transition-all duration-700 delay-500 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="px-6 py-5 border-b border-border bg-muted">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-muted-foreground" />
            {t("about.compliance.certificationsList.title")}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("about.compliance.tableName")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("about.compliance.tableIssueDate")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("about.compliance.tableScope")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("about.compliance.tableStatus")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {certifications.map((cert, index) => (
                <tr key={index} className="hover:bg-muted transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        {getCertificationIcon(cert.name)}
                      </div>
                      <span className="font-medium text-foreground">{cert.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground font-mono text-sm">{cert.issueDate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground text-sm">{cert.scope}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(cert.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}