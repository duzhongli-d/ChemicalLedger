"use client";

import clsx from "clsx";

export type FilterTabValue = "all" | "active" | "expiring10" | "expiring20" | "expired" | "archived";

interface FilterTabsProps {
  activeTab: FilterTabValue;
  onTabChange: (tab: FilterTabValue) => void;
  counts: {
    all: number;
    active: number;
    expiring10: number;
    expiring20: number;
    expired: number;
    archived: number;
  };
  className?: string;
}

const tabLabels: Record<FilterTabValue, { zh: string; en: string }> = {
  all: { zh: "全部", en: "All" },
  active: { zh: "正常", en: "Active" },
  expiring10: { zh: "10天后即将到期", en: "≤10 Days" },
  expiring20: { zh: "20天后即将到期", en: "11-20 Days" },
  expired: { zh: "过期未归档", en: "Expired" },
  archived: { zh: "已归档", en: "Archived" },
};

export function FilterTabs({ activeTab, onTabChange, counts, className = "" }: FilterTabsProps) {
  const tabs: FilterTabValue[] = ["all", "active", "expiring10", "expiring20", "expired", "archived"];

  return (
    <div className={clsx("flex gap-1 p-1 rounded-lg bg-secondary", className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={clsx(
            "relative px-4 py-2 text-sm font-medium rounded-md transition-all",
            activeTab === tab
              ? "text-accent bg-card shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            {tabLabels[tab].zh}
            <span
              className={clsx(
                "px-1.5 py-0.5 text-xs rounded-full",
                activeTab === tab ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
              )}
            >
              {counts[tab]}
            </span>
          </span>
          {activeTab === tab && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
