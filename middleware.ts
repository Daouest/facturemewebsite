// middleware.ts (project root)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ---- config
const COOKIE_NAME = "fm_session";
const ACCESS_TTL_MS = 100 * 60 * 1000; // 100 minutes
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

// ---- types
type SessionPayload = JWTPayload & { idUser: number; factureId?: number };

// ---- helpers (Edge-safe)
async function encrypt(payload: SessionPayload, ttlMs = ACCESS_TTL_MS) {
    const expSeconds = Math.floor((Date.now() + ttlMs) / 1000);
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expSeconds)
        .sign(secret);
}

async function decrypt<T extends JWTPayload = SessionPayload>(
    token: string
): Promise<T | null> {
    try {
        const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
        return payload as T;
    } catch {
        return null;
    }
}

// ---- public path logic
const PUBLIC_PATHS = new Set<string>(["/", "/about", "/favicon.ico"]);
const PUBLIC_PREFIXES = ["/auth", "/_next", "/api/auth", "/images", "/fonts"];
function isPublic(pathname: string) {
    if (PUBLIC_PATHS.has(pathname)) return true;
    return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// ---- middleware
export async function middleware(req: NextRequest) {
    try {
        const { pathname } = req.nextUrl;
        if (isPublic(pathname) || pathname.includes(".")) return NextResponse.next();

        const token = req.cookies.get(COOKIE_NAME)?.value;
        if (!token) return NextResponse.redirect(new URL("/", req.url));

        const session = await decrypt<SessionPayload>(token);
        if (!session) return NextResponse.redirect(new URL("/", req.url));

        // optional silent refresh
        try {
            const renewed = await encrypt(session);
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
        } catch { /* ignore refresh errors */ }

        return NextResponse.next();
    } catch {
        return NextResponse.next();
    }
}

export const config = {
    matcher: ["/((?!auth|api|_next/static|_next/image|favicon.ico).*)"],
};
