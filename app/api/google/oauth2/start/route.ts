import "server-only";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { requireGmailEnv } from "@/app/_lib/schemas/env";

export const runtime = "nodejs";

export async function GET() {
  const email = requireGmailEnv();

  const oauth2 = new google.auth.OAuth2(
    email.GMAIL_CLIENT_ID!,
    email.GMAIL_CLIENT_SECRET!,
    email.GMAIL_REDIRECT_URI!,
  );

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.send"],
  });

  return NextResponse.redirect(url);
}
