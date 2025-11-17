import { NextResponse, NextRequest } from "next/server";
import {
  getAllFacturesUsers,
  // TODO: These functions need to be implemented in queries.ts
  // getFacturesUsersByDate,
  // getFacturesUsersByFactureNumber,
  // getFacturesUsersPaidInvoice,
} from "@/app/_lib/database/queries";
import { COOKIE_NAME, decrypt } from "@/app/_lib/session/session-crypto";


export async function GET(req: NextRequest) {
  try {
    // 🔍 Extraction des paramètres de requête
    const { searchParams } = new URL(req.url);
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const session = token ? await decrypt(token) : null;
    const userId = session?.idUser ?? 0;

    const sortBy = searchParams.get("sorted");
    const filterByPaid = searchParams.get("isPaid");

    // Récupération initiale des factures (true = active invoices)
    let historiqueFactures = await getAllFacturesUsers(userId, true);

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
        console.warn(
          "Invalid start/end params provided to histories-invoices API",
          err,
        );
      }
    }

    // Calcul des métadonnées pour le cache

    //Application des filtres ou tris selon les paramètres
    // TODO: Implement these sorting functions in queries.ts
    if (sortBy === "factureNumber") {
      // historiqueFactures = await getFacturesUsersByFactureNumber(userId, true);
      historiqueFactures = (historiqueFactures || []).sort((a: any, b: any) => 
        (a.factureNumber || 0) - (b.factureNumber || 0)
      );
    } else if (sortBy === "date") {
      // historiqueFactures = await getFacturesUsersByDate(userId, true);
      historiqueFactures = (historiqueFactures || []).sort((a: any, b: any) => 
        new Date(b.dateFacture).getTime() - new Date(a.dateFacture).getTime()
      );
    } else if (filterByPaid === "false") {
      // historiqueFactures = await getFacturesUsersPaidInvoice(userId, true);
      historiqueFactures = (historiqueFactures || []).filter((f: any) => !f.isPaid);
    }

    // Réponse avec les données et les headers de cache
    const response = NextResponse.json(historiqueFactures);

    return response;
  } catch (error) {
    console.error("Erreur API getAllFacturesUsers:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
