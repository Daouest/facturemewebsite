"use client";
import { useRef, useState, useMemo } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebarWrapper from "@/app/components/MobileSidebarWrapper";
import ActionsCard from "@/app/components/ActionsCard";
import { Table } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import { TableItemType } from "@/app/lib/definitions";
import { useQuery } from "@tanstack/react-query";
import { refreshSeconds } from "@/app/lib/constante";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";
import { Search, X } from "lucide-react";

export default function ItemCatalogue() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const countRef = useRef<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    queryKey: ["catalogueItems"],
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
    select: (data) => {
      // Remove duplicates based on idObjet
      const seen = new Set<number>();
      return data.filter((item) => {
        if (seen.has(item.idObjet)) {
          return false;
        }
        seen.add(item.idObjet);
        return true;
      });
    },
  });

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.productName.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        <main className="flex-1 pt-[80px] pb-32 md:pb-40">
          <div className="max-w-7xl mx-auto px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Sidebar with Toggle */}
            <MobileSidebarWrapper>
              <Sidebar />
            </MobileSidebarWrapper>

            {/* Main Content */}
            <section className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main content column */}
                <div className="lg:col-span-8">
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                    {/* Title row */}
                    <div className="grid grid-cols-3 items-center">
                      <div className="col-span-1" />
                      <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                        {t("catalogue")}
                      </h1>
                      <div className="col-span-1 flex justify-end">
                        {/* Search Input */}
                        <div className="relative w-full max-w-[200px]">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-9 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-colors text-sm"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                              aria-label="Clear search"
                            >
                              <X className="h-4 w-4 text-slate-400" />
                            </button>
                          )}
                        </div>
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
                      <div className="h-[500px] overflow-y-auto rounded-xl border border-white/10 bg-white/0 custom-scrollbar">
                        <Table rows={filteredItems ?? []} type="items" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Side actions column */}
                <aside className="lg:col-span-4">
                  <div className="sticky top-[96px]">
                    <ActionsCard
                      actions={[
                        {
                          href: "/item/creation-item",
                          label: t("createItem"),
                          variant: "primary",
                        },
                        {
                          href: "/invoices/create",
                          label: t("newInvoice"),
                          variant: "secondary",
                        },
                      ]}
                    />
                  </div>
                </aside>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
