import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/session/session-node"; 

export async function GET(req: NextRequest) {
    const session = await getSession();
    console.log("session in status",session);

    if (!session) {
        console.log("user not blocked")
        return NextResponse.json({ blockUser: false, expired: true },{ status: 200 });
    }

  
    return NextResponse.json({
        blockUser: session.blockUser ?? false,
        expired: false,
    },{ status: 200 });
}
