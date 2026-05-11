"use client";
import { useRef, useState } from "react";
import clsx from "clsx";
import { adminLedgerApi } from "@/lib/api-client";

export function ImportLedgerModal({
  open,
  onClose,
  onImport,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  isPending: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  const downloadTemplate = () => adminLedgerApi.downloadImportTemplate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 via-teal-400 to-transparent" />
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">批量导入台账</h2>
          <p className="text-sm text-slate-500">台账管理</p>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">支持格式</p>
              <p>.xlsx 或 .csv 文件。品类列格式：品类1 / 品类2</p>
            </div>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".csv"))) {
                setFileName(file.name);
                if (fileRef.current) fileRef.current.files = e.dataTransfer.files;
              }
            }}
            className={clsx(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              fileName ? "border-teal-400 bg-teal-50" : "border-slate-300 hover:border-teal-400 hover:bg-slate-50"
            )}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) setFileName(file.name); }} />
            {fileName ? (
              <>
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-teal-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-900 font-mono-custom">{fileName}</p>
                <p className="text-xs text-slate-500 mt-1">点击重新选择</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm text-slate-600">拖放文件到此处，或点击选择文件</p>
                <p className="text-xs text-slate-400 mt-1">支持 .xlsx, .csv</p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={downloadTemplate}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-mono-custom">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载模板
            </button>
            <button onClick={() => fileRef.current?.files?.[0] && onImport(fileRef.current.files[0])}
              disabled={!fileName || isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 font-mono-custom">
              {isPending ? "导入中..." : "开始导入"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}