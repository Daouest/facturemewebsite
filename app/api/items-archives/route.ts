import { NextResponse, NextRequest } from "next/server";
import {
  getAllFacturesUsers,
  getLastFacture,
  updateFactureUser,
} from "@/app/lib/data";
import { COOKIE_NAME, decrypt } from "@/app/lib/session/session-crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const session = token ? await decrypt(token) : null;
    const userId = session?.idUser ?? 0;

    const isLastFacturesRequested = searchParams.get("lastFactures") === "true";
    const sortBy = searchParams.get("sorted");
    const filterByPaid = searchParams.get("isPaid");

    // console.log("Paramètres reçus:", {
    //   lastFactures: isLastFacturesRequested,
    //   sorted: sortBy,
    //   isPaid: filterByPaid
    // });

    // Récupération initiale des factures
    let factures = await getAllFacturesUsers(userId);

    // Calcul des métadonnées pour le cache
    const totalFactures = factures?.length ?? 0;
    const lastFactureDate = factures?.[totalFactures - 1]?.dateFacture?.toISOString() || new Date().toISOString();


    factures =  factures?.filter(f =>f.isPaid === false);

    //Application des filtres ou tris selon les paramètres
    if (isLastFacturesRequested) {
      factures = await getLastFacture(userId);
    }

    //  Vérification du cache côté client
    const clientEtag = req.headers.get("if-none-match");

    const isCacheValid =
      clientEtag === lastFactureDate &&
      filterByPaid == null &&
      isLastFacturesRequested &&
      (!sortBy || sortBy === "false");
    // console.log("isCacheValid",isCacheValid)

    if (isCacheValid) {
      return new NextResponse(null, { status: 304 });
    }

    // Réponse avec les données et les headers de cache
    const response = NextResponse.json(factures);
    response.headers.set("Etag", lastFactureDate);

    return response;
  } catch (error) {
    console.error("Erreur API getAllFacturesUsers:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}


export async function PUT(request: NextRequest) {
  try {

    const body = await request.json();
    const idFacture = parseInt(body.idFacture);
    let isPaid =  body.isPaid;
    let status = body.status;

    console.log(["idFacture:",idFacture, "isPaid:",isPaid,"status:",status])
    if(isPaid === false) isPaid =  true;
    if(status === true) status = false

    const result = await updateFactureUser(idFacture,status,isPaid);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }


    console.log("facture", result.facture);

    return NextResponse.json(result.facture ?? [], { status: 200 });


  } catch (error) {
    console.error("Erreur API PUT for updateFactureUser :", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}