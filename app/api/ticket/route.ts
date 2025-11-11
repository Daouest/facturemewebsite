import { NextResponse, NextRequest } from "next/server";
import { getAllTickets, updateTicket, deleteTicket } from "@/app/lib/data"



export async function GET(req: NextRequest) {

    try {

        const result = await getAllTickets();
        // console.log("result", result);

        if (!result.success) {
            return NextResponse.json(result, { status: 500 });

        }
        const count = result.ticket ? result.ticket.length.toString() : "0";
        const clientEtag = req.headers.get("if-None-Match");
        const lastTicketDate = result.ticket ? result.ticket?.[parseInt(count) - 1].date.toISOString() : new Date().toISOString();

        // console.log("lastTicketDate ,clientEtag", lastTicketDate,clientEtag)
        // console.log(" clientEtag === lastTicketDate ",  clientEtag === lastTicketDate)
        // console.log("clientCount === count || clientEtag === lastTicketDate ", clientCount === count || clientEtag === lastTicketDate)
        //  const isCacheValid = clientCount === count || clientEtag === lastTicketDate;
 
        if ( clientEtag === lastTicketDate) {
            return new NextResponse(null, { status: 304 });
        }


        const response = NextResponse.json(result.ticket ?? [], { status: 200 });

        response.headers.set("Etag", lastTicketDate);
        response.headers.set("Count", count);
        return response;

    } catch (error) {

        console.error("Erreur dans GET /api/ticket :", error);

        return NextResponse.json({ error: "Impossible d'avoir les ticktes" }, { status: 500 });
    }
}


export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const idClient = parseInt(body.idClient);
        const idTicket = parseInt(body.idTicket);
        const status = body.status;


        const result = await updateTicket(idClient, idTicket, status);

        if (!result.success) {
            return NextResponse.json(result, { status: 500 });
        }


        console.log("data",result.ticket);

        return NextResponse.json(result.ticket ?? [], { status: 200 });

    } catch (error) {

        console.error("Erreur dans GET /api/ticket :", error);

        return NextResponse.json({ error: "Impossible d'avoir les ticktes" }, { status: 500 });
    }
}

// export async function DELETE(request: NextRequest) {

// }