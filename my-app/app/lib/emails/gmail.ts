import { google } from 'googleapis'
import { env } from '@/app/lib/schemas/env'

export function getGmailClient() {
    const oauth2 = new google.auth.OAuth2(
        env.GMAIL_CLIENT_ID,
        env.GMAIL_CLIENT_SECRET,
        env.GMAIL_REDIRECT_URI
    )
    oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })
    return google.gmail({ version: "v1", auth: oauth2 })
}

export async function sendHtmlEmail({
    to,
    subject,
    html,
    from = env.GMAIL_SENDER,
}: {
    to: string;
    subject: string;
    html: string;
    from?: string;
}) {
    const raw = [
        `From: ${from}`,
        `To: <${to}>`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        html
    ].join("\r\n")

    const gmail = getGmailClient()
    const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: Buffer.from(raw).toString("base64url") },
    })

    return res.data
}