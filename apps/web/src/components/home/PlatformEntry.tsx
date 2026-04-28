"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/auth-store";

export function PlatformEntry() {
  const t = useTranslations("home");
  const { isAuthenticated } = useAuthStore();
  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Background dot grid */}
      <div className="absolute inset-0 bg-dot-grid opacity-30"></div>

      <div className="max-w-[1320px] mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* AI Ledger Entry - Orange accent */}
          <Link
            href={isAuthenticated() ? "/ledgers" : "/login"}
            className="group relative glass rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:shadow-2xl"
          >
            {/* Gradient border on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" style={{ padding: '2px' }}>
              <div className="w-full h-full bg-slate-50 rounded-2xl"></div>
            </div>

            {/* Orange glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-[60px] group-hover:bg-orange-500/30 transition-colors"></div>

            <div className="relative flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/30">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t("entry.aiAssistant")}</h3>
            </div>
            <p className="text-gray-600 relative">{t("entry.aiAssistantDesc")}</p>
          </Link>

          {/* Deep Research Entry - Blue accent */}
          <Link
            href={isAuthenticated() ? "/research" : "/login"}
            className="group relative glass rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:shadow-2xl"
          >
            {/* Gradient border on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" style={{ padding: '2px' }}>
              <div className="w-full h-full bg-slate-50 rounded-2xl"></div>
            </div>

            {/* Blue glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px] group-hover:bg-blue-500/30 transition-colors"></div>

            <div className="relative flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t("entry.deepResearch")}</h3>
            </div>
            <p className="text-gray-600 relative">{t("entry.deepResearchDesc")}</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
