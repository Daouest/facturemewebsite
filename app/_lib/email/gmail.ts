import "server-only";
import { gmail_v1, google } from "googleapis";
import { requireGmailEnv } from "@/app/_lib/schemas/env";
export function getGmailClient() {
  const {
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN,
    GMAIL_REDIRECT_URI,
  } = requireGmailEnv();
  const oauth2 = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REDIRECT_URI,
  );
  oauth2.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth: oauth2 });
}
export async function sendHtmlEmail({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<gmail_v1.Schema$Message> {
  const { GMAIL_SENDER } = requireGmailEnv();
  const fromHeader = from ?? GMAIL_SENDER;
  const raw = [
    `From: ${fromHeader}`,
    `To: <${to}>`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    html,
  ].join("\r\n");
  let encoded: string;
  try {
    encoded = Buffer.from(raw).toString("base64url");
  } catch {
    encoded = Buffer.from(raw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }
  const gmail = getGmailClient();
  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encoded },
    });
    return res.data;
  } catch (error: any) {
    console.error("Gmail API Error:", {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.response?.data,
    });
    throw new Error(
      `Failed to send email: ${error.message}. You may need to regenerate your Gmail refresh token.`,
    );
  }
}
