"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { settingsApi, type PublicContactSettings } from "@/lib/api-client";

function ContactCard({
  icon,
  label,
  value,
  isEmail = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  isEmail?: boolean;
}) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-6 flex flex-col items-center text-center hover:border-orange-500/30 transition-colors">
      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{label}</h3>
      {isEmail && value ? (
        <a
          href={`mailto:${value}`}
          className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">{value || "-"}</p>
      )}
    </div>
  );
}

export function ContactInfoCards() {
  const t = useTranslations("contact");

  const { data } = useQuery<PublicContactSettings>({
    queryKey: ["public-contact-settings"],
    queryFn: settingsApi.getContactSettings,
  });

  // Use API value or fall back to i18n default
  const address = data?.address || t("infoCards.addressValue");
  const email = data?.email || "qc@abachem.com";
  const hours = data?.business_hours || t("infoCards.hoursValue");
  const phone = data?.phone || t("infoCards.phoneValue");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Address Card */}
      <ContactCard
        icon={
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        }
        label={t("infoCards.address")}
        value={address}
      />

      {/* Email Card */}
      <ContactCard
        icon={
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        }
        label={t("infoCards.email")}
        value={email}
        isEmail
      />

      {/* Hours Card */}
      <ContactCard
        icon={
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        label={t("infoCards.hours")}
        value={hours}
      />

      {/* Phone Card */}
      <ContactCard
        icon={
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        }
        label={t("infoCards.phone")}
        value={phone}
      />
    </div>
  );
}