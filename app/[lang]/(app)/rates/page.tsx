"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { refreshSeconds } from "@/app/lib/constante";
import { HourlyRateType } from "@/app/lib/definitions";
import { Table } from "@/components/ui/table";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";
import { useParams } from "next/navigation";

export default function RatesPage() {
  const params = useParams();
  const lang = params?.lang as "fr" | "en";
  const { langage } = useLangageContext();
  const t = createTranslator(lang || langage);
  const countRef = useRef<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/hourlyRates", {
      cache: "no-cache",
      headers: {
        "if-count-change": countRef.current ?? "0",
      },
    });

    const data = await res.json();

    const tableRows: HourlyRateType[] = data.map((row: any) => ({
      idObjet: row.idObjet,
      clientName: row.clientName ?? "",
      workPosition: row.workPosition ?? "",
      hourlyRate: row.hourlyRate ?? 0
    }));

    const newCount = res.headers.get("Count");
    if (newCount) countRef.current = newCount;
    if (res.status === 304) {
      throw new Error("Hourly Rates not modified");
    }

    return tableRows ?? [];
  };

  const {
    data: hourlyRates,
    isLoading,
    status,
  } = useQuery<HourlyRateType[]>({
    queryKey: ["hourlyRates"],
    queryFn: async () => {
      try {
        return await fetchData();
      } catch (err: any) {
        if (err.message === "Hourly Rates not modified") {
          return Promise.reject({ status: 304 });
        }
        throw err;
      }
    },
    refetchInterval: refreshSeconds.seconds,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 8000,
  });

  return (
    <section className="flex-1">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
        {/* Title row */}
        <div className="grid grid-cols-3 items-center">
          <div className="col-span-1" />
          <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
            {t("hourlyRatePage")}
          </h1>
          <div className="col-span-1 flex justify-end">
            <Link
              href={`/${lang}/rates/new`}
              className="inline-flex items-center rounded-xl bg-sky-500 px-4 py-2 text-white font-medium shadow hover:bg-sky-400 transition-colors ring-1 ring-sky-400/40"
              aria-label="Créer un taux horaire"
            >
              +
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/10" />

        {status !== "error" && isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Image
              src="/Loading_Paperplane.gif"
              alt="loading"
              width={300}
              height={300}
              className="object-contain max-w-full h-auto opacity-90"
            />
          </div>
        ) : (
          <div className="overflow-y-auto rounded-xl border border-white/10 bg-white/0">
            <Table rows={hourlyRates ?? []} />
          </div>
        )}
      </div>
    </section>
  );
}
