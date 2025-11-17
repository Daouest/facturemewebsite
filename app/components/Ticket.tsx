"use client";
import { useRef, useState } from "react";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/_lib/utils/format";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Table } from "@/components/ui/table";
import { refreshSeconds } from "@/app/_lib/utils/constants";
import { Ticket } from "@/app/_lib/types/definitions";

export default function TickePage() {
  const etagRef = useRef<string | null>(null);
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  const fetchData = async () => {
    const res = await fetch("/api/ticket", {
      cache: "no-cache",
      headers: {
        "if-None-Match": etagRef.current ?? "",
      },
    });
    const newEtag = res.headers.get("Etag");

    if (newEtag) etagRef.current = newEtag;
    const data = await res.json();
    if (res.status == 304) {
      throw new Error("Pas modifié");
    }
    console.log("data ticket page", data);

    const listeTickets: Ticket[] = data.map((ticket: any) => ({
      idClient: ticket.idClient,
      message: ticket.message,
      idTicket: ticket.idTicket,
      date: ticket.date,
      isCompleted: ticket.isCompleted,
      nomClient: ticket.nomClient,
    }));
    console.log("listeTickets", listeTickets);

    return listeTickets ?? [];
  };
  const {
    data: tickets,
    isLoading,
    status,
  } = useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: async () => {
      try {
        return await fetchData();
      } catch (err: any) {
        //erreur 304
        if (err.message === "Pas modifié") {
          return Promise.reject({ status: 304 });
        }
        throw err;
      }
    },
    refetchInterval: 5000, //10 sec
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 8000, //  les données son considérées comme bonne après 8 secondes
  });

  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 pt-[80px]">
        <div className="max-w-6xl mx-auto px-6 pb-10">
          <div className="border-white/10 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 backdrop-blur  shadow-lg rounded-2xl p-6 sm:p-8">
            <div className="my-4 border-t border-gray-200" />
            {status !== "error" && isLoading ? (
              <div className="flex justify-center items-center py-10">
                <p className="text-[18px] font-semibold text-white">
                  {" "}
                  Loading...
                </p>
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
