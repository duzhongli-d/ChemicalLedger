"use client";

import { useTranslations } from "next-intl";

export function ContactInfoCards() {
  const t = useTranslations("contact");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Address Card */}
      <div className="bg-card rounded-xl border border-border/50 p-6 flex flex-col items-center text-center hover:border-orange-500/30 transition-colors">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-foreground mb-2">{t("infoCards.address")}</h3>
        <p className="text-sm text-muted-foreground">{t("infoCards.addressValue")}</p>
      </div>

      {/* Email Card */}
      <div className="bg-card rounded-xl border border-border/50 p-6 flex flex-col items-center text-center hover:border-orange-500/30 transition-colors">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h3 className="font-semibold text-foreground mb-2">{t("infoCards.email")}</h3>
        <a
          href="mailto:qc@abachem.com"
          className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
        >
          qc@abachem.com
        </a>
      </div>

      {/* Hours Card */}
      <div className="bg-card rounded-xl border border-border/50 p-6 flex flex-col items-center text-center hover:border-orange-500/30 transition-colors">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-foreground mb-2">{t("infoCards.hours")}</h3>
        <p className="text-sm text-muted-foreground">{t("infoCards.hoursValue")}</p>
      </div>
    </div>
  );
}