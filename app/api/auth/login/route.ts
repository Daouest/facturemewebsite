export const runtime = "nodejs"

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/app/lib/db/mongodb";
import { DbUsers } from "@/app/lib/models";
import { LoginSchema } from "@/app/lib/schemas/auth";
import { setSessionCookieOnResponse, createUserSession } from "@/app/lib/session/session-node";
import mongoose from "mongoose";

export async function POST(req: Request) {

    await connectToDatabase();

    console.log({
        mong: {
            uriHasFactureMe: process.env.MONGODB_URI?.includes("/FactureMe"),
            db: mongoose.connection.name,
            host: (mongoose.connection as any).host,
        }
    })

    const body = await req.json()
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { message: "Erreur au login", errors: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { email, password } = parsed.data
    const user = await DbUsers.findOne({ email })

    if (!user || !user.password) {
        return NextResponse.json(
            { message: "Invalid email or password" },
            { status: 401 }
        )
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
        return NextResponse.json(
            { message: "Invalid email or password" },
            { status: 401 }
        )
    }

    const token = await createUserSession({ idUser: user.idUser })
    const res = NextResponse.json({
        user: {
            idUser: user.idUser,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin
        },
    })

    setSessionCookieOnResponse(res, token)
    res.headers.set("Cache-Control", "no-store")
    return res
}