import "server-only"
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { requireGmailEnv } from "@/app/lib/schemas/env";

export const runtime = "nodejs"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    if (!code) {
        return NextResponse.json({ error: "missing code" }, { status: 400 })
    }
    const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI } = requireGmailEnv()

    const oauth2 = new google.auth.OAuth2(
        GMAIL_CLIENT_ID!,
        GMAIL_CLIENT_SECRET!,
        GMAIL_REDIRECT_URI!
    )

    const { tokens } = await oauth2.getToken({ code })

    console.log("refresh token : ", tokens.refresh_token)

    return NextResponse.json({
        ok: true,
        hasRefreshToken: !!tokens.refresh_token
    })
}