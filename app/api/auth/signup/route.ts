import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db/mongodb";
import bcrypt from "bcryptjs";
import { DbUsers } from "@/app/lib/models";
import { SignupSchema } from "@/app/lib/schemas/auth";
import { APP_URL } from "@/app/lib/schemas/env";
import { getNextSeq } from "@/app/lib/db/getNextSeq";
import mongoose from "mongoose";
import type { Db, Collection } from "mongodb";
import type { CounterDoc } from "@/app/lib/db/getNextSeq";

export const runtime = "nodejs";

export async function POST(req: Request) {
    console.log(`[SIGNUP] Starting signup process at ${new Date().toISOString()}`);

    try {
        await connectToDatabase();

        console.log({
            mong: {
                uriHasFactureMe: process.env.MONGODB_URI?.includes("/FactureMe"),
                db: mongoose.connection.name,
                host: (mongoose.connection as any).host,
            }
        })

        const body = await req.json();

        const parsed = SignupSchema.safeParse(body);

        if (!parsed.success) {
            const errors: Record<string, string> = {}
            for (const err of parsed.error.issues) {
                const key = err.path.join(".")
                errors[key] = err.message
            }

            return NextResponse.json({ message: "Erreur dans la validation", errors }, {
                status: 400
            })
        }

        //check
        const { username, firstName, lastName, email, password } = parsed.data;

        const userExists = await DbUsers.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            const errors: Record<string, string> = {}
            if (userExists.email?.toLowerCase() == email.toLowerCase()) {
                errors.email = "Email déjà utilisé"
            }
            if (userExists.username?.toLowerCase() == username.toLowerCase()) {
                errors.username = "Username déjà utilisé"
            }

            return NextResponse.json(
                { message: "Mauvaises valeures", errors },
                { status: 409 }
            )
        }

        const db = mongoose.connection.db as unknown as Db;
        const counters: Collection<CounterDoc> = db.collection<CounterDoc>("counters");

        const idUser = await getNextSeq(counters, "users");
        const hash = await bcrypt.hash(password, 12);

        const user = await DbUsers.create({
            idUser,
            username,
            firstName,
            lastName,
            email,
            password: hash,
            // idAddress,
            // idBusiness: null,
            // isActive: true,
            // isAdmin: false,
            // paidAcces: false,
        });

        console.log("[SIGNUP] User created successfully:", user._id.toString());

        // Send confirmation email
        try {
            const emailResponse = await fetch(new URL("/api/auth/send-confirmation", APP_URL), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user._id.toString(),
                    email: user.email
                }),
                cache: "no-store",
            });

            if (!emailResponse.ok) {
                console.warn("[SIGNUP] Email confirmation failed");
            }
        } catch (err) {
            console.error("[SIGNUP] Email confirmation request failed:", err);
        }

        const responseData = {
            user: {
                id: user._id.toString(),
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
            emailConfirmationSend: true,
        };

        console.log("[SIGNUP] Signup completed successfully");
        return NextResponse.json(responseData, { status: 201 });
    }
    catch (e: any) {
        // Handle duplicate key (E11000) from Mongo/Mongoose
        // l'erreur E11000 c'est en gros à cause des duplicates keys
        // source : https://www.mongodb.com/docs/manual/core/index-unique/#unique-index-and-missing-field
        if (e?.code === 11000 && e?.keyPattern) {
            const errors: Record<string, string> = {};
            if (e.keyPattern.email) errors.email = "Email déjà utilisé";
            if (e.keyPattern.username) errors.username = "Username déjà utilisé";
            return NextResponse.json(
                { message: "Conflit: identifiant déjà pris", errors },
                { status: 409 }
            );
        }
        console.error("[SIGNUP] Fatal error:", e);
        return NextResponse.json({ message: "Erreur signup serveur" }, { status: 500 });
    }

}
