import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE_NAME = "fm_session";
const LOGIN_PATH = "/";

// Public paths/prefixes that should bypass auth
const PUBLIC_PATHS = new Set<string>(["/", "/about", "/favicon.ico"]);
const PUBLIC_PREFIXES = [
    "/auth", 
    "/_next", 
    "/api/auth", 
    "/api/google", 
    "/api/calendar/export",  // Calendar subscription endpoint (token-authenticated)
    "/images", 
    "/fonts"
];

function isPublic(pathname: string) {
    if (PUBLIC_PATHS.has(pathname)) return true;
    return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public routes and static assets
    if (isPublic(pathname) || pathname.includes(".")) {
        return NextResponse.next();
    }

    // Gate the rest
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
    }

    return NextResponse.next();
}

// Keep the matcher simple
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
