import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path starts with any locale prefix
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale in path, redirect to default
  // Skip redirect for static files (images, fonts, etc.)
  const isStaticFile = /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i.test(pathname);
  if (!pathnameHasLocale && !pathname.startsWith("/_next") && !pathname.startsWith("/api") && !isStaticFile) {
    const redirectPath = `/${routing.defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Get token from cookie (set by backend on login)
  const token = request.cookies.get("access_token")?.value;

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/admin/login"];

  // Define protected paths (without locale prefix)
  const protectedPaths = ["/ledger/create", "/admin", "/profile", "/notifications"];

  // Get locale from pathname
  const locale = routing.locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (locale) {
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");

    // Check if it's a public path
    const isPublic = publicPaths.some((p) => pathWithoutLocale.startsWith(p));

    // Check if it's a protected path
    const isProtected = protectedPaths.some((p) => pathWithoutLocale.startsWith(p));

    if (isProtected && !token && !isPublic) {
      // Admin routes should redirect to admin login, not user login
      // Explicit check: if path starts with /admin, go to admin login
      const isAdminPath = pathWithoutLocale.startsWith("/admin");
      const redirectPath = isAdminPath
        ? `/${locale}/admin/login`
        : `/${locale}/login`;
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};