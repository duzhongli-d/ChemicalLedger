"use client";

import clsx from "clsx";

export type FilterTabValue = "all" | "active" | "expiring" | "archived";

interface FilterTabsProps {
  activeTab: FilterTabValue;
  onTabChange: (tab: FilterTabValue) => void;
  counts: {
    all: number;
    active: number;
    expiring: number;
    archived: number;
  };
  className?: string;
}

const tabLabels: Record<FilterTabValue, { zh: string; en: string }> = {
  all: { zh: "全部", en: "All" },
  active: { zh: "正常", en: "Active" },
  expiring: { zh: "即将过期", en: "Expiring" },
  archived: { zh: "已归档", en: "Archived" },
};

export function FilterTabs({ activeTab, onTabChange, counts, className = "" }: FilterTabsProps) {
  const tabs: FilterTabValue[] = ["all", "active", "expiring", "archived"];

  return (
    <div className={clsx("flex gap-1 bg-slate-100 p-1 rounded-lg", className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={clsx(
            "relative px-4 py-2 text-sm font-medium rounded-md transition-all",
            activeTab === tab
              ? "text-[#14b8a6] bg-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <span className="flex items-center gap-2">
            {tabLabels[tab].zh}
            <span
              className={clsx(
                "px-1.5 py-0.5 text-xs rounded-full",
                activeTab === tab ? "bg-[#14b8a6]/10 text-[#14b8a6]" : "bg-slate-200 text-slate-500"
              )}
            >
              {counts[tab]}
            </span>
          </span>
          {activeTab === tab && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#14b8a6] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
