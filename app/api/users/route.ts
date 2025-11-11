import { NextResponse, NextRequest } from "next/server";
import { getAllUsers } from "@/app/lib/data"

export async function GET(req: NextRequest) {

    try {

        const result = await getAllUsers();
        // console.log("result users api", result);

        if (!result) {
            return NextResponse.json(result, { status: 500 });

        }
        const count = result ? result.length.toString() : "0";
        // const userEtag = req.headers.get("if-None-Match");
        const userCount = req.headers.get("if-count-change");
        // const lastTicketDate = result ? result?.[parseInt(count) - 1].date.toISOString() : new Date().toISOString();
 
        if ( userCount === count) {
            return new NextResponse(null, { status: 304 });
        }


        const response = NextResponse.json(result ?? [], { status: 200 });

        // response.headers.set("Etag", lastTicketDate);
        response.headers.set("Count", count);
        return response;

    } catch (error) {

        console.error("Erreur dans GET /api/users :", error);

        return NextResponse.json({ error: "Impossible d'avoir les utilisateurs" }, { status: 500 });
    }
}