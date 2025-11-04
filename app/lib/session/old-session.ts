// import "server-only"

// import { SignJWT, jwtVerify, type JWTPayload } from "jose";
// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "../db/mongodb";
// import { DbUsers } from "../models";

// const secretKey = 'secret';
// const key = new TextEncoder().encode(secretKey);

// export const COOKIE_NAME = "fm_session" // fm -> FactureMe
// const ACCESS_TTL_MS = 100 * 60 * 1000 //TTL de 10 mins

// type SessionPayload = JWTPayload & {
//     idUser: number;
//     factureId?: number;
// }

// export async function encrypt(payload: SessionPayload, ttlMs = ACCESS_TTL_MS) {
//     const expSeconds = Math.floor((Date.now() + ttlMs) / 1000)
//     return await new SignJWT(payload)
//         .setProtectedHeader({ alg: 'HS256' })
//         .setIssuedAt()
//         .setExpirationTime(expSeconds)
//         .sign(key);
// }

// //check
// export async function decrypt(input: string): Promise<any> {
//     try {
//         const { payload } = await jwtVerify(input, key, {
//             algorithms: ['HS256']
//         });
//         return payload;
//     } catch {
//         //invalid payload
//         return null
//     }

// }

// export async function createUserSession(opts: {
//     idUser: number;
//     factureId?: number
// }) {
//     return encrypt({ idUser: opts.idUser, factureId: opts.factureId })
// }

// export function setSessionCookieOnResponse(res: NextResponse, token: string, maxAgeMs = ACCESS_TTL_MS) {
//     res.cookies.set({
//         name: COOKIE_NAME,
//         value: token,
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         path: "/",
//         maxAge: Math.floor(maxAgeMs / 1000)
//     })
//     return res
// }

// export async function getSession(): Promise<SessionPayload | null> {
//     const cookieStore = await cookies();
//     const token = cookieStore.get(COOKIE_NAME)?.value ?? null
//     if (!token) {
//         return null
//     }
//     return decrypt(token)
// }

// export async function getUserFromCookies() {
//     //on get la session du cookie
//     const session = await getSession()
//     if (!session) {
//         return null
//     }
//     //on get le user de la session
//     const idUser = session?.idUser

//     //on hard check pour être sur que c'est un chiffre et non un string
//     if (typeof idUser !== "number" || !Number.isFinite(idUser)) {
//         return null
//     }
//     await connectToDatabase()
//     const userFromDb = await DbUsers.findOne({ idUser }).lean()

//     if (!userFromDb) return null

//     return {
//         idUser: userFromDb.idUser,
//         username: userFromDb.username,
//         firstName: userFromDb.firstName,
//         lastName: userFromDb.lastName,
//         email: userFromDb.email,
//         __v: userFromDb.__v,
//     }
// }

// //on update le cookie
// export async function updateSession(request: NextRequest) {
//     //on check first si le cookie existe
//     const token = request.cookies.get(COOKIE_NAME)?.value;
//     if (!token) {
//         return null
//     }

//     //s'il existe, on le delete pour le update
//     let parsed = await decrypt(token)
//     if (!parsed) {
//         const res = NextResponse.next()
//         res.cookies.delete(COOKIE_NAME)
//         return res
//     }

//     //encryptage du nouveau token
//     const newToken = await encrypt(parsed)

//     //on reset le nouveau cookie dans la variable cookie
//     //pour qu'il soit accessible
//     const res = NextResponse.next()
//     setSessionCookieOnResponse(res, newToken, ACCESS_TTL_MS)
//     return res
// }

// ///////////////////////////////////////////////////////////////////
// //on pourrait ici penser à mettre le factureId dans le token aussi
// ///////////////////////////////////////////////////////////////////

// export async function setFacture(factureId: number) {
//     // Get current session
//     const session = await getSession();
//     const idUser = session?.idUser;

//     console.log("----------------" + idUser)

//     if (!idUser && idUser != 0 || isNaN(idUser)) {
//         return null;
//     }

//     // Create new token with updated factureId
//     const newToken = await encrypt({ idUser, factureId });

//     // Create response and set the cookie
//     const res = NextResponse.json({ success: true });
//     setSessionCookieOnResponse(res, newToken, ACCESS_TTL_MS);
//     return res;
// }
