import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const { COOKIE_NAME, verifyToken, refreshToken, ACCESS_TTL_MS } =
        await import("./app/lib/session/session-edge");

    const { pathname } = req.nextUrl;
    const isPublic =
        pathname === "/" ||
        pathname === "/about" ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/auth") ||
        pathname.includes(".");

    if (isPublic) return NextResponse.next();

    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.redirect(new URL("/", req.url));

    const session = await verifyToken(token);
    if (!session) return NextResponse.redirect(new URL("/", req.url));

    // Optional silent refresh
    try {
        const renewed = await refreshToken(session);
        const res = NextResponse.next();
        res.cookies.set({
            name: COOKIE_NAME,
            value: renewed,
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            path: "/",
            maxAge: Math.floor(ACCESS_TTL_MS / 1000), // seconds
        });
        return res;
    } catch {
        // ignore refresh errors
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!auth|api|_next/static|_next/image|favicon.ico).*)"],
};
