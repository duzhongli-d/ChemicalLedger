"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { researchApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { LoginModal } from "@/components/auth/LoginModal";
import { NewNotebookModal } from "@/components/research/NewNotebookModal";
import { SourcesPanel } from "@/components/research/SourcesPanel";
import { StudioPanel } from "@/components/research/StudioPanel";

type Message = { q: string; a: string; highlightedSourceIdx?: number };

function parseCitations(text: string): Array<string | { idx: number; filename: string }> {
  const parts: Array<string | { idx: number; filename: string }> = [];
  const regex = /\[(\d+):\s*([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ idx: parseInt(match[1], 10), filename: match[2].trim() });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function MessageContent({ text, sources, onCitationClick }: { text: string; sources: Array<{ id: string; file_name?: string }>; onCitationClick?: (idx: number) => void }) {
  const parts = parseCitations(text);

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (typeof part === "string") {
          return <span key={i}>{part}</span>;
        }
        return (
          <button
            key={i}
            onClick={() => onCitationClick?.(part.idx)}
            className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded bg-orange-100 text-orange-700 text-xs font-medium hover:bg-orange-200 transition-colors cursor-pointer"
            title={`Source ${part.idx}`}
          >
            <span className="font-mono">[{part.idx}]</span>
            <span className="max-w-32 truncate">{part.filename}</span>
          </button>
        );
      })}
    </span>
  );
}

export default function ResearchPage() {
  const t = useTranslations("research");
  const tAuth = useTranslations("auth");
  const isAuth = useAuthStore((s) => !!s.user);
  const queryClient = useQueryClient();
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [highlightedSourceIdx, setHighlightedSourceIdx] = useState<number | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(!isAuth);
  const [newNotebookModalOpen, setNewNotebookModalOpen] = useState(false);

  const requireAuth = () => {
    if (!isAuth) {
      setLoginModalOpen(true);
      return false;
    }
    return true;
  };

  // Sync login modal with auth state to handle Zustand persist hydration timing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isAuth) {
      setLoginModalOpen(false);
    }
  }, [isAuth]);

  const handleCreateNotebook = useCallback(async (notebookId: string, notebookName: string) => {
    await queryClient.invalidateQueries({ queryKey: ["notebooks"] });
    setSelectedNotebook(notebookId);
  }, [queryClient]);

  const { data: quota } = useQuery({
    queryKey: ["quota"],
    queryFn: () => researchApi.getQuota().then((r) => r.data),
    enabled: isAuth,
  });

  const { data: notebooks = [] } = useQuery({
    queryKey: ["notebooks"],
    queryFn: () => researchApi.listNotebooks().then((r) => r.data),
    enabled: isAuth,
  });

  const { data: sources = [] } = useQuery({
    queryKey: ["sources", selectedNotebook],
    queryFn: () => selectedNotebook ? researchApi.listSources(selectedNotebook).then((r) => r.data) : [],
    enabled: !!selectedNotebook,
  });

  const handleCitationClick = useCallback((idx: number) => {
    setHighlightedSourceIdx(idx);
    setTimeout(() => setHighlightedSourceIdx(null), 2000);
  }, []);

  const handleAsk = async () => {
    if (!question.trim() || !selectedNotebook) return;
    const q = question;
    setQuestion("");
    setMessages((prev) => [...prev, { q, a: "..." }]);

    try {
      // Use native fetch for streaming since axios doesn't support stream in browser
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/research/chat`);
      url.searchParams.set('notebook_id', selectedNotebook);
      url.searchParams.set('question', q);

      const response = await fetch(url.toString(), {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      setMessages((prev) =>
        prev.map((m, i) => i === prev.length - 1 ? { ...m, a: "" } : m)
      );

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setMessages((prev) =>
                  prev.map((m, i) => i === prev.length - 1 ? { ...m, a: fullText } : m)
                );
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m, i) => i === prev.length - 1 ? { ...m, a: "Error: Failed to get response" } : m)
      );
    }
  };

  const questionsRemaining = quota ? quota.limit - quota.used_today : 0;

  return (
    <div className="flex flex-col min-h-screen gap-4 pb-4">
      {/* Header Bar */}
      <header className="flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Notebook Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600 font-mono">{t("notebooks")}:</label>
            <select
              value={selectedNotebook || ""}
              onChange={(e) => {
                if (!isAuth) {
                  setLoginModalOpen(true);
                  return;
                }
                setSelectedNotebook(e.target.value || null);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all min-w-[240px]"
            >
              <option value="">-- {t("notebooks")} --</option>
              {notebooks.map((nb: { id: string; notebook_id: string; name: string }) => (
                <option key={nb.id} value={nb.id}>{nb.name}</option>
              ))}
            </select>
          </div>

          {/* New Notebook Button */}
          <button
            onClick={() => {
              if (!isAuth) {
                setLoginModalOpen(true);
                return;
              }
              setNewNotebookModalOpen(true);
            }}
            className="text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
          >
            + {t("newNotebook")}
          </button>
        </div>

        {/* Quota Badge */}
        {quota && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{t("quota")}:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              questionsRemaining > 5
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : questionsRemaining > 0
                ? "bg-orange-50 text-orange-700 border border-orange-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {questionsRemaining} / {quota.limit}
            </span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4">
        {/* Sources Panel (left) */}
        <aside className="w-96 flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-orange-400/50 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 font-mono">{t("sources")}</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedNotebook ? (
              <SourcesPanel notebookId={selectedNotebook} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm p-6 text-center">
                {t("studio.selectNotebook")}
              </div>
            )}
          </div>
        </aside>

        {/* Chat Area (center) */}
        <main className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-orange-400/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 font-mono">{t("title")}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-12">
                {selectedNotebook ? t("placeholder") : t("studio.selectNotebook")}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl rounded-br-sm px-5 py-3 text-sm max-w-md shadow-sm">
                    {m.q}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className={`bg-gray-50 text-gray-800 rounded-2xl rounded-bl-sm px-5 py-3 text-sm max-w-lg border border-gray-100 ${highlightedSourceIdx !== null ? "ring-2 ring-orange-400" : ""}`}>
                    <MessageContent text={m.a} sources={sources} onCitationClick={handleCitationClick} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-gray-100 sticky bottom-0 bg-white z-10">
            <div className="flex gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) => {
                  if (!isAuth) {
                    setLoginModalOpen(true);
                    return;
                  }
                  setQuestion(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (!isAuth) {
                    setLoginModalOpen(true);
                    return;
                  }
                  if (e.key === "Enter") handleAsk();
                }}
                placeholder={t("placeholder")}
                disabled={!selectedNotebook}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 transition-all"
              />
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  handleAsk();
                }}
                disabled={!selectedNotebook || !question.trim()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all shadow-sm"
              >
                {t("ask")}
              </button>
            </div>
          </div>
        </main>

        {/* Studio Panel (right) */}
        <aside className="w-[520px] flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-orange-400/50 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 font-mono">深度研究工作室</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedNotebook ? (
              <StudioPanel notebookId={selectedNotebook} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm p-6 text-center">
                {t("studio.selectNotebook")}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {selectedNotebook ? (
            <>
              <span className="text-gray-500">
                <span className="font-medium text-gray-700">{sources.length}</span> {t("sources")}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">
                <span className="font-medium text-gray-700">{messages.filter(m => m.a && m.a !== "...").length}</span> {t("quota").split(" ").slice(1).join(" ")}
              </span>
            </>
          ) : (
            <span className="text-gray-400">{t("studio.selectNotebook")}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${selectedNotebook ? "bg-teal-500" : "bg-gray-300"}`}></span>
          <span className="text-gray-500">{selectedNotebook ? "Ready" : "Not Selected"}</span>
        </div>
      </footer>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          setLoginModalOpen(false);
        }}
        contextMessage={tAuth("loginRequiredForResearch")}
      />

      <NewNotebookModal
        isOpen={newNotebookModalOpen}
        onClose={() => setNewNotebookModalOpen(false)}
        onSuccess={handleCreateNotebook}
      />
    </div>
  );
}
