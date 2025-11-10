"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebarWrapper from "@/app/components/MobileSidebarWrapper";
import Link from "next/link";
import Image from "next/image";
import { ClientAffichage } from "@/app/lib/definitions";
import { FaPersonCirclePlus } from "react-icons/fa6";

export default function ItemCatalogue() {
  const [clients, setClients] = useState<ClientAffichage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients-catalogue", { cache: "no-cache" });
      const data = await res.json();

      if (data?.clients) {
        const clientsTable: ClientAffichage[] = data.clients.map(
          (client: any) => ({
            idClient: client.idClient,
            nomClient: client.nomClient ?? "N/A",
            address: client.address ?? "N/A",
          })
        );
        setClients(clientsTable);
      } else {
        setClients([]);
      }
    } catch (e) {
      console.error("Erreur chargement clients:", e);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />

        <main className="flex-1 pt-[80px]">
          <div className="w-full max-w-7xl mx-auto px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Sidebar with Toggle */}
            <MobileSidebarWrapper>
              <Sidebar />
            </MobileSidebarWrapper>

            {/* Main Content */}
            <div className="flex-1">
              <div
                id="bigContainer"
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]"
              >
                {/* Header row: centered title with action on the right */}
                <div className="grid grid-cols-3 items-center">
                  <div className="col-span-1" />
                  <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                    Vos clients
                  </h1>
                  <div className="col-span-1 flex items-center justify-end">
                    <Link
                      href={"/clients-catalogue/create"}
                      className="inline-flex items-center rounded-xl border border-sky-400/40 bg-sky-500/10 px-3 py-2 text-sky-200 hover:bg-sky-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                      title="Créer un client"
                    >
                      <FaPersonCirclePlus size={25} className="mr-2" />
                    </Link>
                  </div>
                </div>

                {/* Divider under title */}
                <div className="my-4 border-t border-white/10" />

                {/* Content */}
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Image
                      src="/Loading_Paperplane.gif"
                      alt="loading"
                      width={300}
                      height={300}
                      className="object-contain max-w-full h-auto opacity-90"
                    />
                  </div>
                ) : clients.length > 0 ? (
                  <div className="w-full mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {clients.map((client) => (
                        <div
                          key={client.idClient}
                          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/20 transition-colors"
                        >
                          <h2 className="text-lg font-semibold mb-2 text-slate-100">
                            {client.nomClient}
                          </h2>
                          <div className="flex flex-col space-y-1 text-sm text-slate-300/90">
                            <p>{client.address?.address ?? "N/A"}</p>
                            <p>{client.address?.city ?? "N/A"}</p>
                            <p>
                              {client.address?.zipCode ?? "N/A"}
                              {", "}
                              {client.address?.country ?? "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Empty state
                  <div className="w-full flex flex-col items-center justify-center py-12">
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 backdrop-blur p-8 text-center">
                      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-sky-500/15 ring-1 ring-sky-400/30">
                        <FaPersonCirclePlus className="h-6 w-6 text-sky-300" />
                      </div>
                      <p className="text-slate-200 font-semibold">
                        Aucun client trouvé
                      </p>
                      <p className="text-slate-300/80 text-sm mt-1">
                        Créez votre premier client pour commencer.
                      </p>
                      <Link
                        href={"/clients-catalogue/create"}
                        className="mt-4 inline-flex items-center rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sky-200 hover:bg-sky-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                      >
                        <FaPersonCirclePlus size={18} className="mr-2" />
                        Nouveau client
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
