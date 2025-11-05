import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set<string>(["/", "/about", "/favicon.ico"]);
const PUBLIC_PREFIXES = ["/auth", "/_next", "/api/auth", "/images", "/fonts"];

function isPublic(pathname: string) {
    if (PUBLIC_PATHS.has(pathname)) return true;
    return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
    const { COOKIE_NAME, decrypt, updateSession } = await import("@/app/lib/session/session-edge")
    try {
        const { pathname } = req.nextUrl;

        // Skip public routes & assets
        if (isPublic(pathname) || pathname.includes(".")) {
            return NextResponse.next();
        }

        // Simple cookie presence check
        const token = req.cookies.get(COOKIE_NAME)?.value;
        if (!token) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // verify token (Edge-safe)
        const session = await decrypt(token);
        if (!session) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // refresh token (guarded; if it fails, don't crash)
        try {
            const refreshed = await updateSession(req);
            if (refreshed) return refreshed;
        } catch {
            // swallow refresh errors in middleware
        }

        return NextResponse.next();
    } catch (err) {
        // Never throw from middleware; allow request to continue
        // You can log in Vercel logs if needed:
        // console.error("Middleware error:", err);
        return NextResponse.next();
    }
}

export const config = {
    matcher: ["/((?!auth|api|_next/static|_next/image|favicon.ico).*)"],
};
