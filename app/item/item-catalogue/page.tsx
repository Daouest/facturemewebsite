"use client";
import { useRef } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebarWrapper from "@/app/components/MobileSidebarWrapper";
import { Table } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import { TableItemType } from "@/app/lib/definitions";
import { useQuery } from "@tanstack/react-query";
import { refreshSeconds } from "@/app/lib/constante";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";

export default function ItemCatalogue() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const countRef = useRef<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/item-catalogue", {
      cache: "no-cache",
      headers: {
        "if-count-change": countRef.current ?? "0",
      },
    });

    const data = await res.json();
    const newCount = res.headers.get("Count");

    const tableRows: TableItemType[] = data.map((item: any) => ({
      idObjet: item.idObjet,
      productName: item.productName ?? "",
      price: item?.price ?? 0,
      description: item?.description ?? "",
      productPhoto: item?.productPhoto ?? "",
    }));

    if (newCount) countRef.current = newCount;
    if (res.status === 304) {
      throw new Error("Items non Modifier");
    }

    return tableRows ?? [];
  };

  const {
    data: items,
    isLoading,
    status,
  } = useQuery<TableItemType[]>({
    queryKey: ["items"],
    queryFn: async () => {
      try {
        return await fetchData();
      } catch (err: any) {
        if (err.message === "Items non Modifier") {
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
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                {/* Title row */}
                <div className="grid grid-cols-3 items-center">
                  <div className="col-span-1" />
                  <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                    {t("catalogue")}
                  </h1>
                  <div className="col-span-1 flex justify-end">
                    {/* Create Item button */}
                    <Link
                      href="/item/creation-item"
                      className="inline-flex items-center rounded-xl bg-sky-500 px-4 py-2 text-white font-medium shadow hover:bg-sky-400 transition-colors ring-1 ring-sky-400/40"
                      aria-label="Créer un item"
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
                    <Table rows={items ?? []} />
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
