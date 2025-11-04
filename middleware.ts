import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { COOKIE_NAME, decrypt, updateSessionEdge } from "./app/lib/session/session-mw";
//Un middleware nous permet de run du avant de completer une requete
//On peut ainsi, modifier une response, ou même, redirect si nécéssaire
//On rajoute de la sécurité ainsi que de la performance (rapidité)
//dans le projet

//source : https://nextjs.org/docs/14/app/building-your-application/routing/middleware

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    //on skip toutes les public routes (login, logout, etc)
    if (pathname.startsWith("/auth/*") ||
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname === "/about" ||
        pathname === "/" ||
        pathname.startsWith("/api/auth/*") ||
        pathname.includes(".")) {
        return NextResponse.next()
    }

    //get les info du cookie
    const token = req.cookies.get(COOKIE_NAME)?.value
    const session = token ? await decrypt(token) : null

    //si ya pas un user de connecté dans le cookies
    //on le redirect au login screen
    if (!session) {
        return NextResponse.redirect(new URL("/", req.url))
    }

    //on laisse le user accéder à sa requête et on refresh le cookie
    const refresh = await updateSessionEdge(req)
    return refresh ?? NextResponse.next()
}

export const config = {
    //ici en gros on lui dit de runner dans n'importe quel file 
    //inside "/app", _next/static, _next/image, favicon.ico.
    //Regarder la source en haut
    matcher: ['/((?!auth|api|_next/static|_next/image).*)']
}