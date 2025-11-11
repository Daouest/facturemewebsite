import { NextResponse, NextRequest } from "next/server";
import {
  getAllFacturesUsers,
  getFacturesUsersByDate,
  getFacturesUsersByFactureNumber,
  getFacturesUsersPaidInvoice
} from "@/app/lib/data";
import { COOKIE_NAME, decrypt } from "@/app/lib/session/session-crypto";

export async function GET(req: NextRequest) {
  try {
    // 🔍 Extraction des paramètres de requête
    const { searchParams } = new URL(req.url);
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const session = token ? await decrypt(token) : null;
    const userId = session?.idUser ?? 0;

    const sortBy = searchParams.get("sorted");
    const filterByPaid = searchParams.get("isPaid");

    // console.log("Paramètres reçus:", {
    //   sorted: sortBy,
    //   isPaid: filterByPaid
    // });

    // Récupération initiale des factures
    let historiqueFactures = await getAllFacturesUsers(userId, false);

    // Support filtering by date range to avoid returning a huge pool of invoices.
    // Expected query params: start=YYYY-MM-DD and end=YYYY-MM-DD
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    if (startParam && endParam) {
      try {
        const start = new Date(startParam + "T00:00:00");
        const end = new Date(endParam + "T23:59:59.999");
        historiqueFactures = (historiqueFactures || []).filter((f: any) => {
          const d = new Date(f.dateFacture);
          return d >= start && d <= end;
        });
      } catch (err) {
        console.warn("Invalid start/end params provided to histories-invoices API", err);
      }
    }

    // Calcul des métadonnées pour le cache

    //Application des filtres ou tris selon les paramètres
    if (sortBy === "factureNumber") {
      historiqueFactures = await getFacturesUsersByFactureNumber(userId, false);
    } else if (sortBy === "date") {
      historiqueFactures = await getFacturesUsersByDate(userId, false);
    } else if (filterByPaid === "false") {
      historiqueFactures = await getFacturesUsersPaidInvoice(userId, false);
    }

    // Réponse avec les données et les headers de cache
    const response = NextResponse.json(historiqueFactures);


    return response;
  } catch (error) {
    console.error("Erreur API getAllFacturesUsers:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}