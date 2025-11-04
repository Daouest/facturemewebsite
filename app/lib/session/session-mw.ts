import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const COOKIE_NAME = "fm_session"
const ACCESS_TTL_MS = 100 * 60 * 100

const secret = process.env.SESSION_SECRET ?? "dev-secret"
const key = new TextEncoder().encode(secret)

export type SessionPayload = JWTPayload & { idUser: number; factureId: number }

export async function encrypt(payload: SessionPayload, ttlMs = ACCESS_TTL_MS) {
    const expSeconds = Math.floor((Date.now() + ttlMs) / 1000)

    return await new SignJWT(payload)
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

export function setCookie(res: NextResponse, token: string, maxAgeMs = ACCESS_TTL_MS) {
    res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Math.floor(maxAgeMs / 1000)
    })
}

export async function updateSessionEdge(req: NextRequest) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return null
    const parsed = await decrypt(token)

    if (!parsed) {
        const res = NextResponse.next()
        res.cookies.delete(COOKIE_NAME)
        return res
    }

    const newToken = await encrypt(parsed)
    const res = NextResponse.next()
    setCookie(res, newToken)
    return res
}