"use client";

import { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState<TabId>(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && tabs.some((t) => t.id === tab)) {
      return tab as TabId;
    }
  }
  return initialTab;
});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (activeTab !== initialTab) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeTab, initialTab]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    onActiveTabChange?.(tab);
  };

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