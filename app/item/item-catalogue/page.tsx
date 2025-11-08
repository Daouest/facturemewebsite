"use client";
import { useRef } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
import { Table } from "@/components/ui/table";
import { AiOutlineArrowLeft } from "react-icons/ai";
import Link from "next/link";
import Image from "next/image";
import { TableItemType } from "@/app/lib/definitions";
import { useQuery } from "@tanstack/react-query";
import { refreshSeconds } from "@/app/lib/constante";

export default function ItemCatalogue() {
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
    refetchInterval:8000,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
    staleTime: 8000,
  });

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />

        {/* Back arrow */}
        <Link
          href={"/homePage"}
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          aria-label="Retour à l’accueil"
          title="Retour à l’accueil"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
          <span className="sr-only">Retour</span>
        </Link>

        <main className="flex-1 pt-[80px]">
          <div className="max-w-6xl mx-auto px-6 pb-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              {/* Title row */}
              <div className="grid grid-cols-3 items-center">
                <div className="col-span-1" />
                <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                  Mes produits
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

              {isLoading && status !== "error" ? (
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
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
