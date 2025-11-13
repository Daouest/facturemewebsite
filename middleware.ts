import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE_NAME = "fm_session";
const LANG_COOKIE = "NEXT_LOCALE";
const DEFAULT_LANG = "fr";
const SUPPORTED_LANGS = ["en", "fr"];

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/about",
  "/favicon.ico",
];

// Prefixes that should bypass auth
const PUBLIC_PREFIXES = [
  "/(auth)",
  "/(marketing)",
  "/auth",
  "/_next",
  "/api/auth",
  "/api/google",
  "/api/calendar/export",
  "/images",
  "/fonts",
  "/api/session", // Allow session check without auth
];

function isPublicPath(pathname: string): boolean {
  // Check exact matches
  if (PUBLIC_PATHS.includes(pathname)) return true;
  
  // Check prefixes
  return PUBLIC_PREFIXES.some((prefix) => 
    pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function getPreferredLanguage(req: NextRequest): string {
  // 1. Check cookie
  const cookieLang = req.cookies.get(LANG_COOKIE)?.value;
  if (cookieLang && SUPPORTED_LANGS.includes(cookieLang)) {
    return cookieLang;
  }
  
  // 2. Check Accept-Language header
  const acceptLang = req.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang.split(",")[0].split("-")[0];
    if (SUPPORTED_LANGS.includes(preferred)) {
      return preferred;
    }
  }
  
  // 3. Default
  return DEFAULT_LANG;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets and API routes
  if (pathname.includes(".") || pathname.startsWith("/api/") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Check if path is public (auth pages, marketing pages)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check if pathname has language prefix for app routes
  const pathnameHasLang = SUPPORTED_LANGS.some(
    (lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)
  );

  // Get auth token
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // If accessing app routes without language prefix, redirect to language version
  if (!pathnameHasLang && !isPublicPath(pathname)) {
    // If not authenticated, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // If authenticated, redirect to language-prefixed version
    const lang = getPreferredLanguage(req);
    const newUrl = new URL(`/${lang}${pathname}`, req.url);
    newUrl.search = req.nextUrl.search;
    
    const response = NextResponse.redirect(newUrl);
    response.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: 31536000 });
    return response;
  }

  // For language-prefixed routes, check authentication
  if (pathnameHasLang) {
    const lang = pathname.split("/")[1];
    
    // Check if requires auth (everything under [lang]/(app)/)
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Set language cookie
    const response = NextResponse.next();
    if (!req.cookies.get(LANG_COOKIE) || req.cookies.get(LANG_COOKIE)?.value !== lang) {
      response.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: 31536000 });
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
