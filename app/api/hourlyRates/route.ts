import { NextResponse, NextRequest } from "next/server";
import { getAllHourlyRates } from "@/app/lib/data";

export async function GET(req: NextRequest) {
  try {

    const data = await getAllHourlyRates();

    if(!data.hourlyRates) return;

    //Modif des headers
    const totalRows = data.hourlyRates?.length ?? 0;
    const arrayCount = totalRows.toString();
    const clientCount = req.headers.get("if-count-change");

    //Aucun changement
    if (clientCount === arrayCount) {
      return new NextResponse(null, { status: 304 });
    }

    //Retour du tableau, et set le nouveau header
    const response = NextResponse.json(data.hourlyRates ?? []);
    response.headers.set("Count", arrayCount);
    return response

  } catch (err) {
    console.error("Erreur API getAllHourlyRates:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}