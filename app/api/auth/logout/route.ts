import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/app/lib/session/session-crypto";

export async function POST() {
    const res = NextResponse.json({ ok: true })

    res.cookies.delete({ name: COOKIE_NAME, path: "/" })
    res.headers.set("Cache-Control", "no-store")
    return res
}