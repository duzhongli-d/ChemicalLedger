"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

function FlaskIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-9.25-6.396a8.109 8.109 0 00-2.25-4.5c0 .828.336 1.592.884 2.188a8.109 8.109 0 002.25 4.5" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
  );
}

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
                className="group relative p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/25 hover:border-orange-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-orange-500"><FlaskIcon /></span>
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
                className="group relative p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-primary-500/10 border border-orange-500/25 hover:border-orange-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-orange-500"><BrainIcon /></span>
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
