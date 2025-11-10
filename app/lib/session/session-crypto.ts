// Edge-safe crypto helpers (works in Middleware / Edge Runtime)
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const COOKIE_NAME = "fm_session";
// 100 minutes
export const ACCESS_TTL_MS = 100 * 60 * 1000;

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

// payload type
export type SessionPayload = JWTPayload & {
    idUser: number;
    factureId?: number;
};

// sign (issue) a token
export async function encrypt(
    payload: SessionPayload,
    ttlMs: number = ACCESS_TTL_MS
): Promise<string> {
    const expSeconds = Math.floor((Date.now() + ttlMs) / 1000);
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expSeconds)
        .sign(secret);
}

export async function decrypt<T extends JWTPayload = SessionPayload>(
    token: string
): Promise<T | null> {
    try {
        const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
        return payload as T;
    } catch {
        return null;
    }
}