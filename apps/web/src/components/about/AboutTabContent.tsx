"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AboutTabNav, { TabId, tabs } from "./AboutTabNav";
import PlatformStoryTab from "./tabs/PlatformStoryTab";
import { TechnicalCapabilitiesTab } from "./tabs/TechnicalCapabilitiesTab";
import ComplianceTab from "./tabs/ComplianceTab";
import TeamExpertiseTab from "./tabs/TeamExpertiseTab";

interface AboutTabContentProps {
  initialTab?: TabId;
  onActiveTabChange?: (tab: TabId) => void;
}

const tabComponents: Record<TabId, React.ComponentType> = {
  "platform-story": PlatformStoryTab,
  "technical": TechnicalCapabilitiesTab,
  "compliance": ComplianceTab,
  "team": TeamExpertiseTab,
};

export default function AboutTabContent({
  initialTab = "platform-story",
  onActiveTabChange,
}: AboutTabContentProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync activeTab from URL search params on mount and when searchParams changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.some((t) => t.id === tab)) {
      setActiveTab(tab as TabId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== initialTab) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeTab, initialTab]);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    onActiveTabChange?.(tab);
  }, [onActiveTabChange]);

  const ActivePanel = tabComponents[activeTab];

  return (
    <div>
      <AboutTabNav activeTab={activeTab} setActiveTab={handleTabChange} />
      <div
        className={`
          transition-all duration-300 ease-out
          ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}
        `}
      >
        <ActivePanel />
      </div>
    </div>
  );
}