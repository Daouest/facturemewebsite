import "server-only"
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, ACCESS_TTL_MS, encrypt, decrypt, type SessionPayload, } from "./session-crypto";

export function getTokenFromRequest(req: NextRequest): string | null {
    return req.cookies.get(COOKIE_NAME)?.value ?? null
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
    const token = getTokenFromRequest(req)
    return token ? await decrypt(token) : null;
}

export async function updateSession(req: NextRequest) {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.next()

    const parsed = await decrypt(token)

    if (!parsed) {
        const res = NextResponse.next()
        res.cookies.delete(COOKIE_NAME)
        return res
    }

    const newToken = await encrypt(parsed)
    const res = NextResponse.next()
    res.cookies.set({
        name: COOKIE_NAME,
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Math.floor(ACCESS_TTL_MS / 100)
    })
    return res
}