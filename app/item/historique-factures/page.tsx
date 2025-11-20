"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import MobileSidebarWrapper from "@/app/components/MobileSidebarWrapper";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Table } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import { Facture } from "@/app/lib/definitions";
import {
  createTranslator,
  getFacturesUsersByDate,
  getFacturesUsersByFactureNumber,
} from "@/app/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useLangageContext } from "../../context/langageContext";
import { refreshSeconds } from "@/app/lib/constante";
import { error } from "console";
import Sidebar from "@/app/components/Sidebar";

export default function HistoricInvoices() {
  const [sorterByFactureNumber, setSorterByFactureNumber] = useState(false);
  const [sorterByDate, setSorterByDate] = useState(false);
  const [isLoadingPage, setIsLoading] = useState(false);
  const etagRef = useRef<string | null>(null);
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const queryClient = useQueryClient();
  const [isPageFocused, setIsPageFocused] = useState(true);


  const fetchData = async () => {
    const res = await fetch(`/api/histories-invoices`, {
      cache: "no-cache",
      headers: {
        "if-None-Match": etagRef.current ?? "",
      },
    });
    const data = await res.json();
    const newEtag = res.headers.get("Etag");

    if (newEtag) etagRef.current = newEtag;

    const tableRows: Facture[] = data.map((facture: any) => ({
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
    return tableRows ?? [];
  };

  const {
    data: historiqueFactures,
    isLoading,
    status,
  } = useQuery<Facture[]>({
    queryKey: ["historiqueFactures"],
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
    refetchInterval: isPageFocused? refreshSeconds.seconds: false, //10 sec
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 8000, //  les données son considérées comme bonne après 8 secondes
  });


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
  useEffect(() => {

    if (!sorterByDate || !sorterByFactureNumber) {
      reloadPage();
    }

  }, [sorterByDate, sorterByFactureNumber])

  const sortedData = useMemo(() => {
    if (!historiqueFactures) return [];

    if (sorterByFactureNumber) {

      return getFacturesUsersByFactureNumber(historiqueFactures ?? []);
    } else if (sorterByDate) {

      return getFacturesUsersByDate(historiqueFactures ?? []);
    }


    return historiqueFactures;
  }, [
    historiqueFactures,
    sorterByFactureNumber,
    sorterByDate,
  ]);

  const reloadPage = async () => {
    setIsLoading(true);
    try {
      await fetchData();
      await queryClient.invalidateQueries({ queryKey: ["historiqueFactures"] });
    } catch (err) {
      setIsLoading(false);
      console.error("Erreur lors du reaload", err);
    } finally {
      setIsLoading(false);
    }
  };



return (
  <>
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Header />
      <main className="flex-1 pt-[80px] pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
          {/* Mobile Sidebar with Toggle */}
          <MobileSidebarWrapper>
            <Sidebar />
          </MobileSidebarWrapper>

          {/* Main Content */}
          <section className="flex-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-6 lg:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-100 text-center mb-4">
                {t("historicInvoices")}
              </h1>

              {/* Switches - Stack on mobile, horizontal on larger screens */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-4">
                <div className="flex items-center gap-3">
                  <p className="text-xs sm:text-sm text-slate-300">
                    {t("sortByNumber")}
                  </p>
                  <Switch
                    className="data-[state=checked]:bg-sky-500 transition-colors cursor-pointer"
                    checked={sorterByFactureNumber}
                    onCheckedChange={setSorterByFactureNumber}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs sm:text-sm text-slate-300">
                    {t("sortByDate")}
                  </p>
                  <Switch
                    className="data-[state=checked]:bg-sky-500 transition-colors cursor-pointer"
                    checked={sorterByDate}
                    onCheckedChange={setSorterByDate}
                  />
                </div>

              </div>

              {/* Divider */}
              <div className="mb-4 border-t border-white/10" />

              {/* Body */}
              {status !== "error" && isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Image
                    src="/Loading_Paperplane.gif"
                    alt="loading"
                    width={300}
                    height={300}
                    className="object-contain max-w-full h-auto"
                  />
                </div>
              ) : (
                <div className="mt-2 w-full max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <Table rows={sortedData} type={"invoicesHistories"} />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  </>
);

}
