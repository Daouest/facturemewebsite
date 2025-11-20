"use client"
import { useRef, useState, useEffect } from "react"
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Table } from "@/components/ui/table";
import { refreshSeconds } from "@/app/lib/constante";
import { Ticket } from "@/app/lib/definitions";


export default function TickePage() {
    const etagRef = useRef<string | null>(null);
    const [isPageFocused, setIsPageFocused] = useState(true);

    const { langage } = useLangageContext();
    const t = createTranslator(langage);
    useEffect(() => {
        const handleFocus = () => setIsPageFocused(true);
        const handleBlur = () => setIsPageFocused(false);

        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("blur", handleBlur);
        };
    }, []);
    const fetchData = async () => {
        const res = await fetch("/api/ticket", {
            cache: "no-cache",
            headers: {
                "if-None-Match": etagRef.current ?? ""
            },
        });
        const newEtag = res.headers.get("Etag");

        if (newEtag) etagRef.current = newEtag;
        const data = await res.json();
        if (res.status == 304) {
            throw new Error("Pas modifié");
        }
        console.log("data ticket page", data)

        const listeTickets: Ticket[] = data.map((ticket: any) => ({
            idClient: ticket.idClient,
            message: ticket.message,
            idTicket: ticket.idTicket,
            date: ticket.date,
            isCompleted: ticket.isCompleted,
            nomClient: ticket.nomClient,
        }));
        console.log("listeTickets", listeTickets)

        return listeTickets ?? [];
    };
    const {
        data: tickets,
        isLoading,
        status,

    } = useQuery<Ticket[]>({
        queryKey: ["tickets"],
        queryFn: (async () => {
            try {
                return await fetchData();
            } catch (err: any) { //erreur 304 
                if (err.message === "Pas modifié") {

                    return Promise.reject({ status: 304 });
                }
                throw err;
            }
        }),
        refetchInterval: isPageFocused ? refreshSeconds.seconds : false,//10 sec
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        staleTime: 8000 //  les données son considérées comme bonne après 8 secondes

    })

    return (
        <div className="min-h-dvh flex flex-col">


            <main className="flex-1 pt-[80px]">
                <div className="max-w-6xl mx-auto px-6 pb-10">
                    <div className="border-white/10 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 backdrop-blur  shadow-lg rounded-2xl p-6 sm:p-8">

                        <div className="my-4 border-t border-gray-200" />
                        {status !== "error" && isLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <p className="text-[18px] font-semibold text-white"> Loading...</p>
                            </div>
                        ) : (
                            <div className="mt-2 w-full max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <Table rows={tickets ?? []} />
                            </div>
                        )}
                    </div>
                </div>
            </main>

        </div>
    );

}