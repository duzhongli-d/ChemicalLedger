"use client";

import { usePathname } from "@/i18n/navigation";
import { Header } from "@/components/nav/header";

export function HeaderConditional() {
  const pathname = usePathname();
  // next-intl's usePathname strips the locale prefix (e.g., /zh/admin -> /admin)
  const isLedgerPage =
    /^\/ledgers?(?:\/|$)/.test(pathname) ||
    /^\/ledger\/[^/]+$/.test(pathname);
  const isAdminPage = /^\/admin(?:\/|$)/.test(pathname);

  if (isLedgerPage || isAdminPage) return null;

  return <Header />;
}