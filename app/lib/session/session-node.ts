import "server-only"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { connectToDatabase } from "../db/mongodb"
import { DbUsers } from "../models"
import { COOKIE_NAME, ACCESS_TTL_MS, encrypt, decrypt, type SessionPayload } from "./session-crypto"

export async function getSession(): Promise<SessionPayload | null> {
    const token = (await cookies()).get(COOKIE_NAME)?.value ?? null;
    return token ? await decrypt(token) : null;
}

export async function createUserSession(opts: {
    idUser: number;
    factureId?: number;
}) {
    return encrypt({ idUser: opts.idUser, factureId: opts.factureId })
}

export function setSessionCookieOnResponse(res: NextResponse, token: string, maxAgeMs = ACCESS_TTL_MS) {
    res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Math.floor(maxAgeMs / 1000)
    })
    return res
}

export async function getUserFromCookies() {
    const session = await getSession()
    if (!session) return null

    const { idUser } = session
    if (typeof idUser !== "number" || !Number.isFinite(idUser)) return null;

    await connectToDatabase()

    const userFromDb = await DbUsers.findOne({ idUser }).lean()
    if (!userFromDb) return null

    return {
        idUser: userFromDb.idUser,
        username: userFromDb.username,
        firstName: userFromDb.firstName,
        lastName: userFromDb.lastName,
        email: userFromDb.email,
        __v: userFromDb.__v
    }
}

export async function setFacture(factureId: number) {
    const session = await getSession()
    const idUser = session?.idUser

    if (typeof idUser !== "number" || !Number.isFinite(idUser)) return null

    const newToken = await encrypt({ idUser, factureId })
    const res = NextResponse.json({ success: true })

    return setSessionCookieOnResponse(res, newToken, ACCESS_TTL_MS)
}