import { NextResponse, NextRequest } from "next/server";
import { fetchClientByUserId } from "@/app/_lib/database/queries";
import { COOKIE_NAME, decrypt } from "@/app/_lib/session/session-crypto";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const session = token ? await decrypt(token) : null;
    const data = await fetchClientByUserId(session?.idUser ?? -1);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erreur API getClientByUserId:", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
