"use client";

import { useTranslations } from "next-intl";

interface Milestone {
  year: string;
  label: string;
}

export default function PlatformStoryTab() {
  const t = useTranslations();

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
    <div className="max-w-[1320px] mx-auto px-4 py-12">
      {/* Section Title */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          {t("about.platformStory.title")}
        </h2>
        <div className="h-1 w-20 bg-orange-500 rounded-full" />
      </div>

      {/* Narrative Body */}
      <div className="text-slate-600 leading-relaxed space-y-4 mb-12">
        <p>{t("about.platformStory.body")}</p>
      </div>

      {/* Milestone Timeline Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-8">
          {t("about.platformStory.milestones.title")}
        </h3>

        {/* Timeline */}
        <div className="relative">
          {/* Horizontal connecting line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200" />

          {/* Milestone dots and content */}
          <div className="relative flex justify-between">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Dot */}
                <div className="relative z-10 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow" />

                {/* Year */}
                <span className="mt-3 text-sm font-mono font-semibold text-slate-700">
                  {milestone.year}
                </span>

                {/* Label */}
                <span className="mt-1 text-xs text-slate-500 text-center max-w-[100px] leading-tight">
                  {milestone.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}