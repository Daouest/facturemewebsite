"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
import Link from "next/link";
import Image from "next/image";
import { ClientAffichage } from "@/app/lib/definitions";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { FaPersonCirclePlus } from "react-icons/fa6";

export default function ItemCatalogue() {
  const [clients, setClients] = useState<ClientAffichage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const res = await fetch("/api/clients-catalogue");
    const data = await res.json();

    if (data.clients) {
      const clientsTable: ClientAffichage[] = data.clients.map(
        (client: any) => ({
          idClient: client.idClient,
          nomClient: client.nomClient ?? "N/A",
          address: client.address ?? "N/A",
        })
      );
      setClients(clientsTable);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
      <Header />

      {/* Back arrow fixed under the header */}
      <Link
        href={"/homePage"}
        className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Retour à l’accueil"
        title="Retour à l’accueil"
      >
        <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
      </Link>

      <main className="flex-1 pt-[80px]">
        <div className="w-full max-w-6xl mx-auto px-6 pb-10">
          <div
            id="bigContainer"
            className="bg-white shadow-lg rounded-2xl p-6 sm:p-8"
          >
            {/* Header row: centered title with action on the right */}
            <div className="grid grid-cols-3 items-center">
              <div className="col-span-1" />
              <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 text-center">
                Vos clients
              </h1>
              <div className="col-span-1 flex items-center justify-end">
                <Link
                  href={"/clients-catalogue/create"}
                  className="inline-flex items-center"
                  title="Créer un client"
                >
                  <FaPersonCirclePlus
                    size={36}
                    className="text-blue-700 hover:text-blue-800 transition-colors"
                  />
                </Link>
              </div>
            </div>

            {/* Divider under title */}
            <div className="my-4 border-t border-gray-200" />

            {/* Content */}
            {loading ? (
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
              <>
                {clients.length > 0 ? (
                  <div className="w-full mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {clients.map((client) => (
                        <div
                          key={client.idClient}
                          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                        >
                          <h2 className="text-lg font-semibold mb-2 text-gray-900">
                            {client.nomClient}
                          </h2>
                          <div className="flex flex-col space-y-1 text-sm text-gray-700">
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
                  <div className="w-full flex flex-col items-center justify-center py-12">
                    <p className="text-gray-700">Aucun client trouvé.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
