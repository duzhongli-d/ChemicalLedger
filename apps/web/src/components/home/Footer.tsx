"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("home");

  return (
    <footer id="contact" className="bg-background text-foreground">
      <div className="max-w-[1320px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Contact & Docs */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t("footer.contact")}</h3>
            <p className="text-sm text-muted-foreground mb-2">{t("footer.contactInfo")}</p>
            <p className="text-sm text-muted-foreground mb-4">
              <a href={`mailto:${t("footer.email")}`} className="hover:text-orange-500 transition-colors">
                {t("footer.email")}
              </a>
            </p>
            <Link
              href="/certs"
              className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t("footer.downloadCerts")}
            </Link>
          </div>

          {/* Right: Platform Entries */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t("footer.platformEntry")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/ledgers"
                className="group relative p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 hover:border-orange-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧪</span>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-orange-400 transition-colors">
                      {t("entry.aiAssistant")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{t("entry.aiAssistantDesc")}</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/research"
                className="group relative p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-primary-500/20 border border-orange-500/30 hover:border-orange-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-orange-400 transition-colors">
                      {t("entry.deepResearch")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{t("entry.deepResearchDesc")}</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2026 {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
