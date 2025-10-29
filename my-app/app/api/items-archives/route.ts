import { NextResponse,NextRequest } from "next/server";
import {
  getAllFacturesUsers,
  getLastFacture
} from "@/app/lib/data";
import { COOKIE_NAME, decrypt } from "@/app/lib/session";

export async function GET(req: NextRequest) {
  try {
    // 🔍 Extraction des paramètres de requête
    const { searchParams } = new URL(req.url);
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const session = token ? await decrypt(token) : null;
    const userId = session.idUser ?? 0;

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
    const factureCount = totalFactures.toString();

    //Application des filtres ou tris selon les paramètres
  if (isLastFacturesRequested) {
      factures = await getLastFacture(userId);
    }

    //  Vérification du cache côté client
    const clientEtag = req.headers.get("if-none-match");
    const clientCount = req.headers.get("if-count-change");

    const hasChangedForAccueil = isLastFacturesRequested && clientCount !== factureCount;
    const isCacheValid =
      clientEtag === lastFactureDate &&
      clientCount === factureCount &&
      filterByPaid == null &&
      !hasChangedForAccueil &&
      (!sortBy || sortBy === "false");

    if (isCacheValid) {
      return new NextResponse(null, { status: 304 }); 
    }

    // Réponse avec les données et les headers de cache
    const response = NextResponse.json(factures);
    response.headers.set("Etag", lastFactureDate);
    response.headers.set("Count", factureCount);

    return response;
  } catch (error) {
    console.error("Erreur API getAllFacturesUsers:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}