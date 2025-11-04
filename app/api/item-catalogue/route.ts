import { NextResponse, NextRequest } from "next/server";
import { getAllItems } from "@/app/lib/data";
import { COOKIE_NAME, decrypt } from "@/app/lib/session/session-crypto";
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    const session = token ? await decrypt(token) : null;
    const userId = session?.idUser ?? 0;

    const data = await getAllItems(userId);

    const totalData = data.items?.length ?? 0;
    const objetCouunt = totalData.toString();
    const clientCount = req.headers.get("if-count-change");
    const clientEtag = req.headers.get("if-None-Match");
    const lastFactureDate = data.items?.[totalData - 1]?.dateFacture?.toISOString() || new Date().toISOString();

    if (clientCount === objetCouunt || clientEtag === lastFactureDate) {
      return new NextResponse(null, { status: 304 });
    }
    const response = NextResponse.json(data.items ?? []);
    response.headers.set("Etag", lastFactureDate);
    response.headers.set("Count", objetCouunt);
    return response


  } catch (err) {
    console.error("Erreur API getAllItems:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}