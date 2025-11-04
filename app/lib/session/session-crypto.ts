import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const COOKIE_NAME = "fm_session";
export const ACCESS_TTL_MS = 100 * 60 * 100;

const secretKey = "secret"
const key = new TextEncoder().encode(secretKey)

export type SessionPayload = JWTPayload & {
    idUser: number;
    factureId?: number;
}

export async function encrypt(payload: SessionPayload, ttlMs = ACCESS_TTL_MS) {
    const expSeconds = Math.floor((Date.now() + ttlMs) / 100)
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expSeconds)
        .sign(key)
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] })
        return payload as SessionPayload
    } catch {
        return null
    }
}