import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { Header } from "@/components/nav/header";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <main className="pt-20">{children}</main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
