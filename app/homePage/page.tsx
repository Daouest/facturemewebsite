"use client";
import React, { useRef } from "react";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { getDateNow, createTranslator } from "@/app/lib/utils";
import { LastFactures } from "@/app/components/lastFactures";
import { TableFactureType } from "@/app/lib/definitions";
import { useLangageContext } from "../context/langageContext";
import { refreshSeconds } from "@/app/lib/constante";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  FileDown,
  CreditCard,
  Users,
  Calendar,
} from "lucide-react";

export default function HomePage() {
  const { langage, setLangage } = useLangageContext();
  const etagRef = useRef<string | null>(null);

  const options = [
    { value: "fr", label: "Français" },
    { value: "en", label: "Anglais" },
  ];

  const t = createTranslator(langage);

  const changeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLangage(e.target.value as "fr" | "en");
  };

  const fetchData = async () => {
    const res = await fetch("/api/items-archives?lastFactures=true", {
      cache: "no-cache",
      headers: {
        "if-None-Match": etagRef.current ?? "",
      },
    });
    const newEtag = res.headers.get("Etag");

    if (newEtag) etagRef.current = newEtag;

    const data = await res.json();
    const listeItems: TableFactureType[] = data.map((facture: any) => ({
      idFacture: facture.idFacture,
      idUser: facture.idUser,
      dateFacture: facture.dateFacture,
      typeFacture: facture.typeFacture,
      factureNumber: facture.factureNumber,
      isPaid: facture.isPaid,
      idClient: facture.clientInfo?.idClient,
      nomClient: facture.clientInfo?.nomClient,
    }));

    if (res.status === 304) {
      throw new Error("Pas modifié");
    }

    return listeItems ?? [];
  };

  const {
    data: LastThreeFactures,
    isLoading,
    status,
  } = useQuery<TableFactureType[]>({
    queryKey: ["LastThreeFactures"],
    queryFn: async () => {
      try {
        return await fetchData();
      } catch (err: any) {
        if (err.message === "Pas modifié") {
          return Promise.reject({ status: 304 });
        }
        throw err;
      }
    },
    refetchInterval: refreshSeconds.seconds,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: refreshSeconds.staleTime,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Background */}
      <div className="relative flex flex-1 justify-center items-start pt-[80px] pb-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 overflow-hidden">
        {/* soft glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-7xl flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <section className="flex-1 flex flex-col gap-6">
              {/* Recent invoices */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-300" />{" "}
                  {t("recentInvoices")}
                </h3>
                {status !== "error" && isLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <Image
                      src="/image_loading.gif"
                      alt="loading"
                      width={50}
                      height={100}
                      className="object-contain max-w-full h-auto opacity-80 bg-none"
                    />
                  </div>
                ) : (
                  <LastFactures rows={LastThreeFactures ?? []} />
                )}
              </div>

              {/* News */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-300" /> {t("news")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg p-4 text-center font-medium text-slate-200 border border-white/10 bg-white/5 transition-transform hover:-translate-y-1 hover:bg-white/10">
                    <FileDown className="w-5 h-5 text-sky-300 mx-auto mb-2" />
                    {t("exportPDF")}
                  </div>
                  <div className="rounded-lg p-4 text-center font-medium text-slate-200 border border-white/10 bg-white/5 transition-transform hover:-translate-y-1 hover:bg-white/10">
                    <CreditCard className="w-5 h-5 text-sky-300 mx-auto mb-2" />
                    {t("onlinePayment")}
                  </div>
                  <Link
                    href="/clients-catalogue"
                    className="rounded-lg p-4 text-center font-medium text-slate-200 border border-white/10 bg-white/5 transition-transform hover:-translate-y-1 hover:bg-white/10"
                  >
                    <Users className="w-5 h-5 text-sky-300 mx-auto mb-2" />
                    {t("clientManagement")}
                  </Link>
                  <Link
                    href="/calendar"
                    className="rounded-lg p-4 text-center font-medium text-slate-200 border border-white/10 bg-white/5 transition-transform hover:-translate-y-1 hover:bg-white/10"
                  >
                    <Calendar className="w-5 h-5 text-sky-300 mx-auto mb-2" />
                    {t("calendar")}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
