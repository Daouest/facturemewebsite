import { NextResponse } from "next/server";
import { google } from "googleapis";
import { env } from "@/app/lib/schemas/env";

export async function GET() {
    const oauth2 = new google.auth.OAuth2(
        env.GMAIL_CLIENT_ID!,
        env.GMAIL_CLIENT_SECRET!,
        env.GMAIL_REDIRECT_URI!
    )

    const url = oauth2.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/gmail.send"]
    })

    return NextResponse.redirect(url)
}