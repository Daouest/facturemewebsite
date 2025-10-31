import { NextResponse } from "next/server";
import { google } from "googleapis";
import { env } from "@/app/lib/schemas/env";

export async function GET(req: Request) {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    if (!code) {
        return NextResponse.json({ error: "missing code" }, { status: 400 })
    }

    const oauth2 = new google.auth.OAuth2(
        env.GMAIL_CLIENT_ID!,
        env.GMAIL_CLIENT_SECRET!,
        env.GMAIL_REDIRECT_URI!

    )

    const { tokens } = await oauth2.getToken({ code })

    console.log("refresh token : ", tokens.refresh_token)

    return NextResponse.json({
        ok: true,
        hasRefreshToken: !!tokens.refresh_token
    })
}