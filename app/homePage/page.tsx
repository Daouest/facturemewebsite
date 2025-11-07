"use client";
import React, { useRef } from "react";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
import { useQuery } from "@tanstack/react-query";
import { getDateNow, createTranslator } from "@/app/lib/utils";
import { LastFactures } from "@/app/components/lastFactures";
import { TableFactureType } from "@/app/lib/definitions";
import { useLangageContext } from "../context/langageContext";
import { useUser } from "@/app/context/UserContext";
import Link from "next/link";
import { refreshSeconds } from "@/app/lib/constante";
export default function HomePage() {
  const { langage, setLangage } = useLangageContext();
  const { user } = useUser();
  const etagRef = useRef<string | null>(null);
  const countRef = useRef<string | null>(null);

  const options = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
  ];

  const t = createTranslator(langage);

  const changeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLangage(e.target.value as "fr" | "en");
  };

  const fetchData = async () => {
    const res = await fetch("/api/items-archives?lastFactures=true", {
      cache: "no-cache",
      headers: {
        "if-None-Match": etagRef.current ?? "",
        "if-count-change": countRef.current ?? "0",
      },
    });
    const newEtag = res.headers.get("Etag");
    const newCount = res.headers.get("Count");

    if (newEtag) etagRef.current = newEtag;
    if (newCount) countRef.current = newCount;
    const data = await res.json();
    const listeItems: TableFactureType[] = data.map((facture: any) => ({
      idFacture: facture.idFacture,
      idUser: facture.idUser,
      dateFacture: facture.dateFacture,
      typeFacture: facture.typeFacture,
      factureNumber: facture.factureNumber,
      isPaid: facture.isPaid,
      idClient: facture.clientInfo?.idClient,
      nomClient: facture.clientInfo?.nomClient,
    }));

    if (res.status == 304) {
      throw new Error("Pas modifié");
    }
    return listeItems ?? [];
  };


  const {
    data: LastThreeFactures,
    isLoading,
    status,

  } = useQuery<TableFactureType[]>({
    queryKey: ["LastThreeFactures"],
    queryFn: (async () => {
      try {
        return await fetchData();
      } catch (err: any) { //erreur 304 
        if (err.message === "Pas modifié") {

          return Promise.reject({ status: 304 });
        }
        throw err;
      }
    }),
    refetchInterval: refreshSeconds.seconds,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: refreshSeconds.staleTime //  les données son considérées comme bonne après 8 secondes

  })

  return (
    <>
      <Header />

      <div className="relative flex justify-center items-start pt-[80px] min-h-screen bg-gradient-to-r from-blue-50 via-white to-blue-100 px-6 overflow-hidden">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 w-full max-w-7xl">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3 bg-white shadow-lg rounded-xl p-6 flex flex-col items-center border border-gray-100">
            <Image
              src="/default_user.png"
              alt="profile"
              width={96}
              height={96}
              className="rounded-full w-24 h-24 mb-4"
            />
            <h2 className="text-lg font-semibold text-gray-800">
              {t("hello") + " "}
              {     `${user?.firstName
                    ?.charAt(0)
                    .toUpperCase()}${user?.firstName?.substring(1, 5) ?? ""} ${user?.lastName?.charAt(0).toUpperCase() ?? ""
                  }${user?.lastName?.substring(1, 5) ?? ""}`}
            
            </h2>
            <p className="text-sm text-gray-500 mb-6">{t("dashboard")}</p>

            <nav className="w-full flex flex-col gap-2">
              <Link
                href="/item/items-archives"
                className="text-left px-4 py-2 rounded-lg font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {t("invoices")}
              </Link>
              <Link
                href="/invoices/create"
                className="text-left px-4 py-2 rounded-lg font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {t("newInvoice")}
              </Link>
              <Link
                href="/item/item-catalogue"
                className="text-left px-4 py-2 rounded-lg font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {t("catalogue")}
              </Link>
              <Link
                href="/item/creation-item"
                className="text-left px-4 py-2 rounded-lg font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {t("createItem")}
              </Link>
              <Link
                href="/pub"
                className="text-left px-4 py-2 rounded-lg font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
              >
                ⭐ {t("info")}
              </Link>
              <Link
                href="/profile"
                className="text-left px-4 py-2 rounded-lg font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {t("profile")}
              </Link>
              {
                user?.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-left px-4 py-2 rounded-lg font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                   👤 {t("admin_section")}
                  </Link>
                )
              }
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
            {/* Lang / Date */}
            <div className="flex justify-end items-center text-sm font-semibold text-gray-700 gap-4">
              <div>
                <label htmlFor="dropdown" className="mr-2 text-gray-600">
                  {t("chooseLanguage")}
                </label>
                <select
                  id="dropdown"
                  value={langage}
                  onChange={changeLang}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p>{getDateNow()}</p>
            </div>

            {/* Recent invoices */}
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📄</span> {t("recentInvoices")}
              </h3>
              {status !== "error" && isLoading ? (
                <div className="flex justify-center items-center">
                  <Image
                    src="/image_loading.gif"
                    alt="loading"
                    width={50}
                    height={100}
                    className="object-contain max-w-full h-auto"
                  />
                </div>
              ) : (
                <LastFactures rows={LastThreeFactures ?? []} />
              )}
            </div>

            {/* News */}
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-600">🆕</span> {t("news")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center font-medium text-gray-700 shadow-sm transition-transform hover:-translate-y-1 hover:bg-blue-100">
                  {t("exportPDF")}
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center font-medium text-gray-700 shadow-sm transition-transform hover:-translate-y-1 hover:bg-blue-100">
                  {t("onlinePayment")}
                </div>
                <Link
                  href="/clients-catalogue"
                  className="bg-blue-50 rounded-lg p-4 text-center font-medium text-gray-700 shadow-sm transition-transform hover:-translate-y-1 hover:bg-blue-100"
                >
                  {t("clientManagement")}
                </Link>
                <Link
                  href="/calendar"
                  className="bg-blue-50 rounded-lg p-4 text-center font-medium text-gray-700 shadow-sm transition-transform hover:-translate-y-1 hover:bg-blue-100"
                >
                  {t("calendar")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

/*
On peut le voir comme une base de données locale de tes requêtes HTTP.
Quand tu appelles useQuery, React Query va :

demander à ton QueryClient s’il a déjà la donnée en cache ;

sinon, exécuter le queryFn (fetch) ;

stocker le résultat dans le cache ;

fournir data, isLoading, isFetching, etc., à ton composant.

Sans QueryClient, React Query ne peut pas stocker ou partager les données
*/
