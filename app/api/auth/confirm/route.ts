export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/_lib/database/mongodb";
import { hashToken } from "@/app/lib/emails/token";
import { ConfirmQuery } from "@/app/_lib/schemas/auth";
import { ObjectId } from "mongodb";
import { APP_URL } from "@/app/_lib/schemas/env";

const redirect = (
  slug: "verified" | "link-invalid" | "link-expired" | "link-already-used",
) => NextResponse.redirect(new URL(`/auth/email/${slug}`, APP_URL));

export async function GET(req: Request) {
  const url = new URL(req.url);

  //si jamais le token passée en paramètre n'est pas valide, on redirect
  const parsed = ConfirmQuery.safeParse({
    token: url.searchParams.get("token"),
  });
  if (!parsed.success) {
    return redirect("link-invalid");
  }

  //const token = url.searchParams.get("token")
  const token = parsed.data.token;
  const hash = hashToken(token);

  const conn = await connectToDatabase();
  const db = conn.connection.db;

  //pour pas que TS panique lors du deployment
  if (!db) {
    return NextResponse.json(
      { error: "erreur lors de la connextion avec la DB" },
      { status: 500 },
    );
  }

  const doc = await db
    .collection("email_token")
    .findOne({ hash, purpose: "email-verify" });

  if (!token) {
    return NextResponse.json({ error: "missing token" }, { status: 400 });
  }

  //pour faire des tests
  //return NextResponse.json({ ok: true, tokenReceived: token })

  //si le lien est pas bon par rapport au lien dela db
  if (!doc) {
    return redirect("link-invalid");
  }

  //si le lien a deja été utilisé
  if (doc.used) {
    return redirect("link-already-used");
  }

  //si le lien dépasse le temps qu'on a set
  if (new Date(doc.expiresAt).getTime() < Date.now()) {
    return redirect("link-expired");
  }

  //update dans la bd
  await db
    .collection("email_token")
    .updateOne({ _id: doc._id }, { $set: { used: true, usedAt: new Date() } });
  await db
    .collection("users")
    .updateOne(
      { _id: new ObjectId(doc.uid) },
      { $set: { emailVerified: new Date() } },
    );

  return redirect("verified");
}
