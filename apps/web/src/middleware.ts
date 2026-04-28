import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path starts with any locale prefix
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale in path, redirect to default
  if (!pathnameHasLocale && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
    const redirectPath = `/${routing.defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Get token from cookie (set by zustand persist)
  const token = request.cookies.get("auth")?.value;
  const parsedToken = token ? JSON.parse(token) : null;
  const actualToken = parsedToken?.state?.token;

  // Define protected paths (without locale prefix)
  const protectedPaths = ["/ledger/create", "/research", "/admin", "/profile", "/notifications"];

  // Get locale from pathname
  const locale = routing.locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (locale) {
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");
    const isProtected = protectedPaths.some((p) => pathWithoutLocale.startsWith(p));

    if (isProtected && !actualToken) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};