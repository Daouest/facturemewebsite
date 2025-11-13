"use client";

import { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ActionsCard from "@/app/components/ActionsCard";
import { Table } from "@/components/ui/table";
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
import { useLangageContext } from "@/app/context/langageContext";
import { useParams } from "next/navigation";

export default function InvoicesPage() {
  const [sorterByFactureNumber, setSorterByFactureNumber] = useState(false);
  const [sorterByDate, setSorterByDate] = useState(false);
  const [sortByPaidInvoice, setSortByPaidInvoice] = useState(false);

  const params = useParams();
  const lang = params?.lang as "fr" | "en";
  const etagRef = useRef<string | null>(null);
  const countRef = useRef<string | null>(null);
  const { langage } = useLangageContext();

  const t = createTranslator(lang || langage);

  const fetchData = async () => {
    const res = await fetch("/api/items-archives", {
      cache: "no-cache",
      headers: {
        "if-None-Match": etagRef.current ?? "",
        "if-count-change": countRef.current ?? "0",
      },
    });
    if (res.status == 304) {
      throw Error("Pas modifié");
    }

    const newEtag = res.headers.get("Etag");
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
    data: archivedFactures,
    isLoading,
    status,
  } = useQuery<Facture[]>({
    queryKey: ["archivedFactures"],
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

  const sortedFactures = useMemo(() => {
    if (!archivedFactures) return [];
    if (sorterByFactureNumber) {
      return getFacturesUsersByFactureNumber(archivedFactures ?? []);
    } else if (sortByPaidInvoice) {
      return getFacturesUsersPaidInvoice(archivedFactures ?? []);
    } else if (sorterByDate) {
      return getFacturesUsersByDate(archivedFactures ?? []);
    }
    return archivedFactures;
  }, [archivedFactures, sorterByFactureNumber, sortByPaidInvoice, sorterByDate]);

  return (
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
                href: `/${lang}/invoices/new`,
                label: t("newInvoice"),
                variant: "primary",
              },
            ]}
          />

          {/* Filters Card */}
          {archivedFactures && archivedFactures?.length > 0 && (
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
  );
}
