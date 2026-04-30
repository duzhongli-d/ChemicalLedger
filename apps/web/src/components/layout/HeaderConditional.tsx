"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/nav/header";

export function HeaderConditional() {
  const pathname = usePathname();
  // Check for ledger routes — use regex to avoid /ledger matching /ledgers
  const isLedgerPage =
    /^\/(?:zh|en)?\/ledgers?(?:\/|$)/.test(pathname) ||
    /^\/(?:zh|en)?\/ledger\/[^/]+$/.test(pathname);

  if (isLedgerPage) return null;

  return <Header />;
}