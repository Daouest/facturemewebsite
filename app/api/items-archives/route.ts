import { NextResponse, NextRequest } from "next/server";
import { getAllFacturesUsers, getLastFacture } from "@/app/_lib/database/queries";
import { COOKIE_NAME, decrypt } from "@/app/_lib/session/session-crypto";

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
    const lastFactureDate =
      factures?.[totalFactures - 1]?.dateFacture?.toISOString() ||
      new Date().toISOString();

    //Application des filtres ou tris selon les paramètres
    if (isLastFacturesRequested) {
      factures = await getLastFacture(userId);
    }

    //  Vérification du cache côté client
    const clientEtag = req.headers.get("if-none-match");

    const hasChangedForAccueil = isLastFacturesRequested;
    const isCacheValid =
      clientEtag === lastFactureDate &&
      filterByPaid == null &&
      !hasChangedForAccueil &&
      (!sortBy || sortBy === "false");

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
      { status: 500 },
    );
  }
}
