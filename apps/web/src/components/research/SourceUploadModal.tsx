"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { researchApi } from "@/lib/api-client";

interface SourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
}

type SourceType = "PDF" | "URL" | "TEXT" | "VIDEO" | "AUDIO";

export function SourceUploadModal({ isOpen, onClose, notebookId }: SourceUploadModalProps) {
  const t = useTranslations("research");
  const [mode, setMode] = useState<"file" | "url">("file");
  const [sourceType, setSourceType] = useState<SourceType>("PDF");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return researchApi.uploadSource(notebookId, file);
    },
    onSuccess: () => {
      setUploadProgress(null);
      setFileName("");
      setUrl("");
      onClose();
    },
    onError: () => {
      setUploadProgress(null);
    },
  });

  const addUrlMutation = useMutation({
    mutationFn: async (data: { url: string; title?: string }) => {
      return researchApi.addUrlSource(notebookId, data.url, data.title);
    },
    onSuccess: () => {
      setUploadProgress(null);
      setFileName("");
      setUrl("");
      onClose();
    },
    onError: () => {
      setUploadProgress(null);
    },
  });

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setUploadProgress(0);
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);
    uploadMutation.mutate(file, {
      onSettled: () => clearInterval(interval),
    });
  }, [uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlSubmit = () => {
    if (!url.trim()) return;
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);
    addUrlMutation.mutate(
      { url, title: url.split("/").pop() || url },
      { onSettled: () => clearInterval(interval) }
    );
  };

  const handleClose = () => {
    if (!uploadMutation.isPending && !addUrlMutation.isPending) {
      setFileName("");
      setUrl("");
      setUploadProgress(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const sourceTypes: SourceType[] = ["PDF", "URL", "TEXT", "VIDEO", "AUDIO"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{t("addSource")}</h3>
          <button
            onClick={handleClose}
            disabled={uploadMutation.isPending || addUrlMutation.isPending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Mode Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("file")}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                mode === "file"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("uploadFile")}
            </button>
            <button
              onClick={() => setMode("url")}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                mode === "url"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("addUrl")}
            </button>
          </div>

          {/* Source Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("sourceType")}
            </label>
            <div className="flex gap-2 flex-wrap">
              {sourceTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSourceType(type)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    sourceType === type
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload Area */}
          {mode === "file" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                id="source-file-input"
                className="hidden"
                accept={sourceType === "PDF" ? ".pdf" : undefined}
                onChange={handleFileInput}
                disabled={uploadMutation.isPending}
              />
              <label
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-gray-400">
                  {fileName ? (
                    <div>
                      <div className="font-medium text-gray-700">{fileName}</div>
                      <div className="text-sm mt-1">{t("clickToChange")}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl mb-2">📁</div>
                      <div className="text-sm">{t("dragDropFile")}</div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}

          {/* URL Input Area */}
          {mode === "url" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("urlAddress")}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                disabled={uploadMutation.isPending}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              />
              <button
                onClick={handleUrlSubmit}
                disabled={!url.trim() || uploadMutation.isPending}
                className="mt-3 w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
              >
                {t("addUrl")}
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {uploadProgress < 100 ? t("uploading") : t("processing")}
                </span>
                <span className="text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadMutation.isError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {t("uploadFailed")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}