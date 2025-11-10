"use client";
import { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebarWrapper from "@/app/components/MobileSidebarWrapper";
import ActionsCard from "@/app/components/ActionsCard";
import { Table } from "@/components/ui/table";
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
import { refreshSeconds } from "@/app/lib/constante";
import { useLangageContext } from "../../context/langageContext";

export default function ItemCatalogue() {
  const [sorterByFactureNumber, setSorterByFactureNumber] = useState(false);
  const [sorterByDate, setSorterByDate] = useState(false);
  const [sortByPaidInvoice, setSortByPaidInvoice] = useState(false);

  const etagRef = useRef<string | null>(null);
  const countRef = useRef<string | null>(null);
  const { langage } = useLangageContext();

  const t = createTranslator(langage);

  const fetchData = async () => {
    const res = await fetch("/api/items-archives", {
      cache: "no-cache",
      headers: {
        "if-None-Match": etagRef.current ?? "",
        "if-count-change": countRef.current ?? "0",
      },
    });
    if (res.status == 304) {
      // si pas mofifié on fait rien
      throw Error("Pas modifié");
    }

    const newEtag = res.headers.get("Etag"); //on met à jour et on stocke le nounvel Etag:
    const newCount = res.headers.get("Count");
    if (newEtag) etagRef.current = newEtag;
    if (newCount) countRef.current = newCount;

    const data = await res.json();

    const tableRows: Facture[] = data.map((facture: any) => ({
      idFacture: facture.idFacture,
      idUser: facture.idUser,
      dateFacture: facture.dateFacture,
      typeFacture: facture.typeFacture,
      factureNumber: facture.factureNumber,
      isPaid: facture.isPaid,
      isActive: facture.isActive,
      idClient: facture.clientInfo?.idClient,
      nomClient: facture.clientInfo?.nomClient,
    }));

    return tableRows ?? [];
  };

  const {
    data: factures,
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
    staleTime: refreshSeconds.staleTime, //  les données son considérées comme bonne après 8 secondes
  });

  const sortedFactures = useMemo(() => {
    // trier en mémoire, sans refaire de requête
    if (!factures) return [];
    if (sorterByFactureNumber) {
      return getFacturesUsersByFactureNumber(factures ?? []);
    } else if (sortByPaidInvoice) {
      return getFacturesUsersPaidInvoice(factures ?? []);
    } else if (sorterByDate) {
      return getFacturesUsersByDate(factures ?? []);
    }
    return factures;
  }, [factures, sorterByFactureNumber, sortByPaidInvoice, sorterByDate]);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />

        <main className="flex-1 pt-[80px]">
          <div className="max-w-7xl mx-auto px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Sidebar with Toggle */}
            <MobileSidebarWrapper>
              <Sidebar />
            </MobileSidebarWrapper>

            {/* Main Content */}
            <div className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main table column */}
                <div className="lg:col-span-8">
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center mb-6">
                      {t("archivedInvoices")}
                    </h1>

                    <div className="my-4 border-t border-white/10" />

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
                        <Table rows={sortedFactures ?? []} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Side actions column */}
                <aside className="lg:col-span-4">
                  <div className="sticky top-[96px] space-y-6">
                    {/* Actions Card */}
                    <ActionsCard
                      actions={[
                        {
                          href: "/invoices/create",
                          label: t("newInvoice"),
                          variant: "primary",
                        },
                        {
                          href: "/item/historique-factures",
                          label: t("historicInvoices"),
                          variant: "secondary",
                        },
                      ]}
                    />

                    {/* Filters Card */}
                    {factures && factures?.length > 0 && (
                      <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                        <h3 className="text-sm font-semibold text-slate-200 mb-4">
                          {t("filters")}
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-300">
                              {t("sortByNumber")}
                            </p>
                            <Switch
                              className="data-[state=checked]:bg-sky-400 transition-colors cursor-pointer"
                              checked={sorterByFactureNumber}
                              onCheckedChange={setSorterByFactureNumber}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-300">
                              {t("sortByDate")}
                            </p>
                            <Switch
                              className="data-[state=checked]:bg-sky-400 transition-colors cursor-pointer"
                              checked={sorterByDate}
                              onCheckedChange={setSorterByDate}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-300">
                              {t("sortByPaidInvoice")}
                            </p>
                            <Switch
                              className="data-[state=checked]:bg-sky-400 transition-colors cursor-pointer"
                              checked={sortByPaidInvoice}
                              onCheckedChange={setSortByPaidInvoice}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </aside>
              </div>

              {/* Mobile switches - below the table */}
              <div
                className={`${
                  factures && factures?.length > 0 ? "flex" : "hidden"
                } md:hidden flex-col gap-4 mt-6 px-6`}
              >
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                  <p className="text-sm text-slate-300">{t("sortByNumber")}</p>
                  <Switch
                    className="data-[state=checked]:bg-sky-400 transition-colors cursor-pointer"
                    checked={sorterByFactureNumber}
                    onCheckedChange={setSorterByFactureNumber}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                  <p className="text-sm text-slate-300">{t("sortByDate")}</p>
                  <Switch
                    className="data-[state=checked]:bg-sky-400 transition-colors cursor-pointer"
                    checked={sorterByDate}
                    onCheckedChange={setSorterByDate}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                  <p className="text-sm text-slate-300">
                    {t("sortByPaidInvoice")}
                  </p>
                  <Switch
                    className="data-[state=checked]:bg-sky-400 transition-colors cursor-pointer"
                    checked={sortByPaidInvoice}
                    onCheckedChange={setSortByPaidInvoice}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
