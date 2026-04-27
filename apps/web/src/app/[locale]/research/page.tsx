"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { researchApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

export default function ResearchPage() {
  const t = useTranslations("research");
  const { isAuthenticated } = useAuthStore();
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ q: string; a: string }[]>([]);

  const { data: quota } = useQuery({
    queryKey: ["quota"],
    queryFn: () => researchApi.getQuota().then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const { data: notebooks = [] } = useQuery({
    queryKey: ["notebooks"],
    queryFn: () => researchApi.listNotebooks().then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const handleAsk = async () => {
    if (!question.trim() || !selectedNotebook) return;
    const q = question;
    setQuestion("");
    setMessages((prev) => [...prev, { q, a: "正在思考中..." }]);
    // Placeholder: real implementation would stream from NotebookLM API
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m, i) => i === prev.length - 1 ? { ...m, a: `[演示] 您问了: ${q}。NotebookLM 集成待实现。` } : m)
      );
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar: notebooks */}
      <aside className="w-64 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 overflow-y-auto">
        <h2 className="font-bold text-gray-900 mb-4">{t("notebooks")}</h2>
        {notebooks.length === 0 ? (
          <p className="text-sm text-gray-400">{t("noData")}</p>
        ) : (
          <ul className="space-y-2">
            {notebooks.map((nb: { id: string; name: string }) => (
              <li key={nb.id}>
                <button
                  onClick={() => setSelectedNotebook(nb.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedNotebook === nb.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                  }`}
                >
                  {nb.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Main: chat */}
      <main className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{t("title")}</h2>
          {quota && (
            <span className="text-sm text-gray-500">
              {t("quota")}: {quota.limit - quota.used_today} / {quota.limit}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-12">
              {selectedNotebook ? t("placeholder") : "请先选择一个笔记本开始提问"}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-blue-100 text-blue-900 rounded-xl rounded-br-sm px-4 py-2 text-sm max-w-md">
                  {m.q}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-xl rounded-bl-sm px-4 py-2 text-sm max-w-lg whitespace-pre-wrap">
                  {m.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder={t("placeholder")}
              disabled={!selectedNotebook}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
            <button
              onClick={handleAsk}
              disabled={!selectedNotebook || !question.trim()}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
            >
              {t("ask")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
