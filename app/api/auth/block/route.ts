import { NextRequest, NextResponse } from "next/server";
import { setCookieBlock } from "@/app/lib/session/session-node"; // ton fichier partagé

export async function POST(req: NextRequest) {
  const { blockUser } = await req.json();
  console.log("blockuser", blockUser);

  const result = await setCookieBlock(blockUser);

  if (!result) {
    return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
  }

  return result;
}
