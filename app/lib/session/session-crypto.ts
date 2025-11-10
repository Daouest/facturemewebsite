// Edge-safe crypto helpers (works in Middleware / Edge Runtime)
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { randomBytes } from "crypto";

export const COOKIE_NAME = "fm_session";
// 100 minutes
export const ACCESS_TTL_MS = 100 * 60 * 1000;

// Use a consistent environment variable name and ensure it exists
const secretKey = process.env.JWT_SECRET || process.env.SESSION_SECRET;
if (!secretKey) {
    throw new Error("JWT_SECRET or SESSION_SECRET environment variable must be set");
}
const secret = new TextEncoder().encode(secretKey);

// payload type
export type SessionPayload = JWTPayload & {
    idUser: number;
    factureId?: number;
};

// sign (issue) a token with a unique JTI (JWT ID) to prevent token reuse
export async function encrypt(
    payload: SessionPayload,
    ttlMs: number = ACCESS_TTL_MS
): Promise<string> {
    const expSeconds = Math.floor((Date.now() + ttlMs) / 1000);
    const jti = randomBytes(16).toString("hex"); // Unique token ID

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expSeconds)
        .setJti(jti) // Add unique JWT ID
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
