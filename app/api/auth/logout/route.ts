import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/app/lib/session/session-crypto";

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_NAME);

        return NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { message: "Failed to logout" },
            { status: 500 }
        );
    }
}
