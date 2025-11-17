"use client";
import { useRef, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { refreshSeconds } from "@/app/_lib/utils/constants";
import { HourlyRateType } from "@/app/_lib/types/definitions";
import { Table } from "@/components/ui/table";
import { useLangageContext } from "../context/langageContext";
import { createTranslator } from "@/app/_lib/utils/format";

export default function HourlyRates() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const countRef = useRef<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = async () => {
    //Appel de l'API
    const res = await fetch("/api/hourlyRates", {
      cache: "no-cache",
      headers: {
        "if-count-change": countRef.current ?? "0",
      },
    });

    //Recherche des donnees
    const data = await res.json();

    const tableRows: HourlyRateType[] = data.map((row: any) => ({
      idObjet: row.idObjet,
      clientName: row.clientName ?? "",
      workPosition: row.workPosition ?? "",
      hourlyRate: row.hourlyRate ?? 0,
    }));

    //Comparaison des headers
    const newCount = res.headers.get("Count");
    if (newCount) countRef.current = newCount;
    if (res.status === 304) {
      throw new Error("Hourly Rates not modified");
    }

    return tableRows ?? [];
  };

  //Loading des donnees
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
    <>
      <Header />
      <div className="relative flex justify-center items-start pt-[80px] pb-8 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6">
        {/* soft glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg hover:bg-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/50"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Mobile backdrop */}
            {isSidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar - Slide in from left on mobile, always visible on desktop */}
            <aside
              className={`
                                fixed lg:relative top-20 lg:top-0 left-0 h-[calc(100vh-5rem)] lg:h-auto
                                w-64 lg:w-auto
                                transform transition-transform duration-300 ease-in-out
                                ${
                                  isSidebarOpen
                                    ? "translate-x-0"
                                    : "-translate-x-full lg:translate-x-0"
                                }
                                z-50 lg:z-auto
                                lg:flex-shrink-0
                            `}
            >
              <Sidebar />
            </aside>

            {/* Main Content */}
            <section className="flex-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                {/* Title row */}
                <div className="grid grid-cols-3 items-center">
                  <div className="col-span-1" />
                  <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                    {t("hourlyRatePage")}
                  </h1>
                  <div className="col-span-1 flex justify-end">
                    {/* Create Item button */} {/* todo */}
                    <Link
                      href="/hourlyRates/create"
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
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
