import { NextResponse } from "next/server"
import { connectToDatabase } from "@/app/lib/db/mongodb";
import { SendConfirmationBody } from "@/app/lib/schemas/auth"
import { createEmailToken } from "@/app/lib/emails/token"
import { confirmEmailHtml } from "@/app/lib/emails/emailTemplate"
import { sendHtmlEmail } from "@/app/lib/emails/gmail"
import { APP_URL } from "@/app/lib/schemas/env"

export const runtime = "nodejs";

const EXP_MINUTES = 30

export async function POST(req: Request) {
    const json = await req.json().catch(() => null)
    const parsed = SendConfirmationBody.safeParse(json)

    if (!parsed.success) {
        return NextResponse.json({ message: "Invalid body" }, { status: 400 })
    }

    const { uid, email } = parsed.data
    const conn = await connectToDatabase()
    const db = conn.connection.db

    //pour pas que TS panique lors du deployment
    if (!db) {
        return NextResponse.json({ error: "erreur lors de la connextion avec la DB" }, { status: 500 })
    }

    const { token, hash, expiresAt } = createEmailToken(EXP_MINUTES)

    await db.collection("email_token").insertOne({
        hash,
        uid,
        email,
        used: false,
        createdAt: new Date(),
        expiresAt,
        purpose: "email-verify"
    })

    const verifyUrl = new URL("/api/auth/confirm", "https://factureme.io")
    verifyUrl.searchParams.set("token", token)

    await sendHtmlEmail({
        to: email,
        subject: "Confirmer votre email",
        html: confirmEmailHtml(verifyUrl.toString()),
    })

    return NextResponse.json({ ok: true })
}