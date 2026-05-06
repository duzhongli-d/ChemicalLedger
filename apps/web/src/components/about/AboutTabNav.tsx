"use client";

import { useTranslations } from "next-intl";

export type TabId = "platform-story" | "technical" | "compliance" | "team";

interface AboutTabNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const tabs: { id: TabId; labelKey: string }[] = [
  { id: "platform-story", labelKey: "about.tabs.platformStory" },
  { id: "technical", labelKey: "about.tabs.technicalCapabilities" },
  { id: "compliance", labelKey: "about.tabs.compliance" },
  { id: "team", labelKey: "about.tabs.team" },
];

export default function AboutTabNav({ activeTab, setActiveTab }: AboutTabNavProps) {
  const t = useTranslations();

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      {/* Mobile fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 md:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden" />

      {/* Scrollable tab container */}
      <div className="overflow-x-auto scrollbar-hide relative">
        <nav className="flex justify-center min-w-max px-4 md:px-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200
                  ${
                    isActive
                      ? "text-orange-600"
                      : "text-slate-500 hover:text-slate-800"
                  }
                `}
                style={{ minWidth: "fit-content" }}
              >
                {t(tab.labelKey)}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                )}
                {!isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-transparent group-hover:bg-slate-200 transition-colors duration-200" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}