"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
import { Table } from "@/components/ui/table";
import { AiOutlineArrowLeft } from "react-icons/ai";
import Link from "next/link";
import Image from "next/image";
import { Facture } from "@/app/lib/definitions";
import {
  createTranslator,
  getFacturesUsersByDate,
  getFacturesUsersByFactureNumber,
  getFacturesUsersPaidInvoice,
} from "@/app/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useLangageContext } from "../../context/langageContext";
import { refreshSeconds } from "@/app/lib/constante";

export default function HistoricInvoices() {
  const [sorterByFactureNumber, setSorterByFactureNumber] = useState(false);
  const [sorterByDate, setSorterByDate] = useState(false);
  const [sortByPaidInvoice, setSortByPaidInvoice] = useState(false);
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  const fetchData = async () => {
    const res = await fetch(`/api/histories-invoices`);
    const data = await res.json();
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
    return tableRows ?? [];
  };

  const {
    data: historiqueFactures,
    isLoading,
    status,
  } = useQuery<Facture[]>({
    queryKey: ["factures"],
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
    refetchInterval: refreshSeconds.seconds, //10 sec
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 8000, //  les données son considérées comme bonne après 8 secondes
  });

  const sortedData = useMemo(() => {
    if (!historiqueFactures) return [];
    if (sorterByFactureNumber) {
      return getFacturesUsersByFactureNumber(historiqueFactures ?? []);
    } else if (sortByPaidInvoice) {
      return getFacturesUsersPaidInvoice(historiqueFactures ?? []);
    } else if (sorterByDate) {
      return getFacturesUsersByDate(historiqueFactures ?? []);
    }
    return historiqueFactures;
  }, [
    historiqueFactures,
    sorterByFactureNumber,
    sorterByDate,
    sortByPaidInvoice,
  ]);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
        <Header />

        {/* Back arrow fixed under the header */}
        <Link
          href={"/item/items-archives"}
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Retour"
          title="Retour"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
        </Link>

        <main className="flex-1 pt-[80px]">
          <div className="max-w-6xl mx-auto px-6 pb-10">
            <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
              {/* Header row: centered title, switches on the right */}
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="col-span-1" />
                <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 text-center">
                  {t("historicInvoices")}
                </h1>
                <div className="col-span-1 flex items-center justify-end gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-700 mb-1">
                      {t("sortByNumber")}
                    </p>
                    <Switch
                      className="data-[state=checked]:bg-blue-400 transition-colors cursor-pointer"
                      checked={sorterByFactureNumber}
                      onCheckedChange={setSorterByFactureNumber}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-700 mb-1">
                      {t("sortByDate")}
                    </p>
                    <Switch
                      className="data-[state=checked]:bg-blue-400 transition-colors cursor-pointer"
                      checked={sorterByDate}
                      onCheckedChange={setSorterByDate}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-700 mb-1">
                      {t("sortByPaidInvoice")}
                    </p>
                    <Switch
                      className="data-[state=checked]:bg-blue-400 transition-colors cursor-pointer"
                      checked={sortByPaidInvoice}
                      onCheckedChange={setSortByPaidInvoice}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-gray-200" />

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
                  <Table rows={sortedData} />
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
