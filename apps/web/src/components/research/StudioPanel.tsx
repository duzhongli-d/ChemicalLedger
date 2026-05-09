"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { LearningGuideView } from "./LearningGuideView";
import { MindMapView } from "./MindMapView";
import { PPTView } from "./PPTView";
import { researchApi } from "@/lib/api-client";
import { useMutation, useQuery } from "@tanstack/react-query";

type Tab = "learning-guide" | "mindmap" | "ppt";

interface GeneratedContent {
  learningGuide?: {
    title: string;
    sections: { heading: string; content: string }[];
  };
  mindmap?: {
    root: {
      id: string;
      text: string;
      children?: { id: string; text: string; children?: { id: string; text: string }[] }[];
    };
  };
  ppt?: {
    title: string;
    slides: { title: string; bulletPoints: string[] }[];
  };
}

const tabIcons: Record<Tab, string> = {
  "learning-guide": "📚",
  "mindmap": "🧠",
  "ppt": "📊",
};

export function StudioPanel({ notebookId }: { notebookId: string }) {
  const t = useTranslations("research");
  const [activeTab, setActiveTab] = useState<Tab>("learning-guide");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState<GeneratedContent | null>(null);

  // Reset content when notebook changes to ensure fresh state per notebook
  useEffect(() => {
    setContent(null);
    setTopic("");
  }, [notebookId]);

  // Query sources for context-aware UI
  const { data: sources = [] } = useQuery({
    queryKey: ["sources", notebookId],
    queryFn: () => researchApi.listSources(notebookId).then((r) => r.data),
    enabled: !!notebookId,
  });

  const guideMutation = useMutation({
    mutationFn: (topic: string) => researchApi.studio.generateLearningGuide(notebookId, topic).then((r) => r.data),
    onSuccess: (data) => setContent((prev) => ({ ...prev, learningGuide: data })),
  });

  const mindmapMutation = useMutation({
    mutationFn: (topic: string) => researchApi.studio.generateMindMap(notebookId, topic).then((r) => r.data),
    onSuccess: (data) => setContent((prev) => ({ ...prev, mindmap: data })),
  });

  const pptMutation = useMutation({
    mutationFn: (topic: string) => researchApi.studio.generatePPT(notebookId, topic).then((r) => r.data),
    onSuccess: (data) => setContent((prev) => ({ ...prev, ppt: data })),
  });

  const handleGenerate = () => {
    if (!topic.trim()) return;
    if (activeTab === "learning-guide") {
      guideMutation.mutate(topic);
    } else if (activeTab === "mindmap") {
      mindmapMutation.mutate(topic);
    } else {
      pptMutation.mutate(topic);
    }
  };

  const isGenerating =
    guideMutation.isPending || mindmapMutation.isPending || pptMutation.isPending;

  const tabs: { key: Tab; label: string }[] = [
    { key: "learning-guide", label: t("studio.learningGuide") },
    { key: "mindmap", label: t("studio.mindMap") },
    { key: "ppt", label: t("studio.ppt") },
  ];

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <p className="text-sm text-gray-500">{t("studio.subtitle")}</p>
          {notebookId && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              sources.length > 0
                ? "bg-teal-50 text-teal-600 border border-teal-200"
                : "bg-gray-100 text-gray-400 border border-gray-200"
            }`}>
              {sources.length > 0 ? "✓" : "○"} {sources.length} 来源
            </span>
          )}
        </div>
      </div>

      {/* Card Container */}
      <div className="rounded-2xl border border-gray-200 shadow-sm hover:border-orange-400/50 hover:shadow-lg transition-all duration-300 bg-white p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                activeTab === tab.key
                  ? "px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 bg-orange-500 text-white shadow-md"
                  : "px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-100"
              }
            >
              <span className="mr-2">{tabIcons[tab.key]}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Topic Input + Generate Button */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("studio.topicPlaceholder")}
              className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-orange-400 focus:ring-0 transition-all duration-200"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className={`
              px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200
              flex items-center gap-2 shadow-md
              ${isGenerating || !topic.trim()
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-600 text-white hover:shadow-lg"
              }
            `}
          >
            <span>{isGenerating ? "⏳" : "✨"}</span>
            {isGenerating
              ? t("studio.generating")
              : topic.trim()
                ? t("studio.generate")
                : "输入主题后启用"}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-[280px] max-h-[400px]">
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-full max-w-md space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
              </div>
              <p className="mt-4 text-sm text-gray-400">{t("studio.generating")}</p>
            </div>
          )}

          {!isGenerating && !content && notebookId && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <div className="text-6xl">📚</div>
                {sources.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                    {sources.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                {sources.length === 0
                  ? "添加来源后，输入主题即可生成内容"
                  : `基于 ${sources.length} 个来源，输入主题开始生成`}
              </p>
            </div>
          )}

          {!isGenerating && activeTab === "learning-guide" && content?.learningGuide && (
            <LearningGuideView data={content.learningGuide} />
          )}

          {!isGenerating && activeTab === "mindmap" && content?.mindmap && (
            <MindMapView data={content.mindmap} />
          )}

          {!isGenerating && activeTab === "ppt" && content?.ppt && (
            <PPTView data={content.ppt} />
          )}
        </div>
      </div>
    </div>
  );
}
