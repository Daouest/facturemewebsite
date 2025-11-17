import { NextResponse, NextRequest } from "next/server";
import { getClientById, getClients } from "@/app/_lib/database/queries";

export async function GET(req: NextRequest) {
  try {
    const result = await getClients();

    if (!result) {
      return NextResponse.json(result, { status: 500 });
    }
    const count = result ? result.length.toString() : "0";
    // const clientEtag = req.headers.get("if-None-Match");
    const clientCount = req.headers.get("if-count-change");
    // const lastTicketDate = result ? result?.[parseInt(count) - 1].date.toISOString() : new Date().toISOString();

    if (clientCount === count) {
      return new NextResponse(null, { status: 304 });
    }

    const response = NextResponse.json(result ?? [], { status: 200 });

    // response.headers.set("Etag", lastTicketDate);
    response.headers.set("Count", count);
    return response;
  } catch (error) {
    console.error("Erreur dans GET /api/client/clients :", error);

    return NextResponse.json(
      { error: "Impossible d'avoir les clients" },
      { status: 500 },
    );
  }
}
