"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("home");

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: 'var(--slate-900)', color: 'var(--slate-300)' }}
    >

      <div className="max-w-[1320px] mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Contact & Docs */}
          <div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              {t("footer.contact")}
            </h3>
            <p
              className="text-sm mb-2"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {t("footer.contactInfo")}
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <a
                href={`mailto:${t("footer.email")}`}
                className="transition-colors hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                {t("footer.email")}
              </a>
            </p>
            <Link
              href="/certs"
              className="inline-flex items-center gap-2 text-sm transition-colors hover-lift"
              style={{ color: 'var(--accent)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t("footer.downloadCerts")}
            </Link>
          </div>

          {/* Right: Platform Entries */}
          <div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              {t("footer.platformEntry")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/ledgers"
                className="group relative p-4 rounded-xl transition-all hover-lift"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧪</span>
                  <div>
                    <p
                      className="font-medium transition-colors"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {t("entry.aiAssistant")}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {t("entry.aiAssistantDesc")}
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/research"
                className="group relative p-4 rounded-xl transition-all hover-lift"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <p
                      className="font-medium transition-colors"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {t("entry.deepResearch")}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {t("entry.deepResearchDesc")}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div
          className="mt-8 pt-8 text-center text-sm"
          style={{
            borderTop: '1px solid var(--border)',
            color: 'var(--muted-foreground)'
          }}
        >
          © 2026 {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
