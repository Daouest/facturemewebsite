import "server-only";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { requireGmailEnv } from "@/app/_lib/schemas/env";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI } =
      requireGmailEnv();

    console.log("OAuth2 Authorization - Starting...");
    console.log("Redirect URI:", GMAIL_REDIRECT_URI);

    const oauth2 = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      GMAIL_REDIRECT_URI,
    );

    const authUrl = oauth2.generateAuthUrl({
      access_type: "offline", // Required to get refresh token
      scope: ["https://www.googleapis.com/auth/gmail.send"], // Permission to send emails
      prompt: "consent", // Forces Google to return a refresh token even if user previously authorized
    });

    console.log("Generated auth URL:", authUrl);

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("OAuth2 Authorization Error:", error.message);
    return NextResponse.json(
      {
        error: "Failed to generate authorization URL",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
