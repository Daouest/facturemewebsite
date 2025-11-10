import { NextResponse, NextRequest } from "next/server";
import { getAllHourlyRates } from "@/app/lib/data";
import { getUserFromCookies } from "@/app/lib/session/session-node";
import { insertHourlyRate, updateHourlyRate } from "@/app/lib/data";

export async function GET(req: NextRequest) {
  try {

    const data = await getAllHourlyRates();

    if (!data.hourlyRates) return;

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

export async function POST(request: NextRequest) {

  try {
    //Data from request
    const body = await request.json();
    let itemData = body.formData;

    //User
    const userData = await getUserFromCookies();
    const idUser = userData?.idUser;
    itemData.idUser = idUser;

    const result = await insertHourlyRate(itemData);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {

    console.error("Erreur dans GET /api/hourlyRates/create :", error);

    return NextResponse.json({ error: "Impossible d'insérer le taux horaire" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {

  try {
    //Data from request
    const body = await request.json();
    let itemData = body.formData;

    //M.A.J.
    const result = await updateHourlyRate(itemData);

    //Echec
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    //Succes
    return NextResponse.json(result, { status: 200 });
  } catch (error) {

    console.error("Erreur dans GET /api/hourlyRates/update :", error);

    return NextResponse.json({ error: "Impossible de M.A.J. le taux horaire" }, { status: 500 });
  }
}