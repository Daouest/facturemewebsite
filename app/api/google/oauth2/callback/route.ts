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

    try {
        const { tokens } = await oauth2.getToken({ code })

        console.log("=".repeat(80))
        console.log("Gmail OAuth2 Tokens Received:")
        console.log("=".repeat(80))

        if (tokens.refresh_token) {
            console.log("✅ REFRESH TOKEN:", tokens.refresh_token)
            console.log("\nAdd this to your .env file:")
            console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`)
        } else {
            console.log("⚠️  No refresh token received!")
            console.log("This usually means the app was previously authorized.")
            console.log("Revoke access at: https://myaccount.google.com/permissions")
        }

        console.log("\nAccess Token:", tokens.access_token)
        console.log("Expires:", tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : "N/A")
        console.log("=".repeat(80))

        return NextResponse.json({
            ok: true,
            hasRefreshToken: !!tokens.refresh_token,
            refreshToken: tokens.refresh_token || null,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
            message: tokens.refresh_token
                ? "Success! Copy the refresh token from the console logs."
                : "No refresh token. Revoke app access and try again."
        })
    } catch (error: any) {
        console.error("Error exchanging code for tokens:", error)
        return NextResponse.json({
            error: "Failed to exchange code for tokens",
            details: error.message
        }, { status: 500 })
    }
}