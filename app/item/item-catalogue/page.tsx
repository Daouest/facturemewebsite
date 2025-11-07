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
    if (res.status == 304) {
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
    refetchInterval:refreshSeconds.seconds,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
    staleTime: refreshSeconds.staleTime,
  });

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
        <Header />

        {/* Back arrow*/}
        <Link
          href={"/homePage"}
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Retour à l’accueil"
          title="Retour à l’accueil"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
        </Link>

        <main className="flex-1 pt-[80px]">
          <div className="max-w-6xl mx-auto px-6 pb-10">
            <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
              <div className="grid grid-cols-3 items-center">
                <div className="col-span-1" />
                <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 text-center">
                  Catalogue
                </h1>
                <div className="col-span-1 flex justify-end">
                  {/* Create Item button */}
                  <Link
                    href="/item/creation-item"
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white font-medium shadow hover:bg-blue-700 transition-colors"
                    aria-label="Créer un item"
                  >
                    Ajouter un nouvel item
                  </Link>
                </div>
              </div>

              {/* Divider line separating title from body */}
              <div className="my-4 border-t border-gray-300" />

              {isLoading && status !== "error" ? (
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
                <div className="overflow-y-auto">
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
