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

    if (res.status === 304) {
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

        <div className="relative z-10 w-full max-w-7xl flex flex-col gap-6">
          {/* Lang / Date */}
          <div className="flex justify-end items-center text-sm font-semibold text-slate-200 gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="dropdown" className="mr-1 text-slate-300/80">
                {t("chooseLanguage")}
              </label>
              <div className="relative">
                <select
                  id="dropdown"
                  value={langage}
                  onChange={changeLang}
                  className="border border-white/10 bg-white/5 text-slate-100 rounded-md px-2 py-1 text-sm outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 appearance-none pr-8"
                >
                  {options.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>
            <p className="text-slate-300/80">{getDateNow()}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="col-span-12 lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col items-center">
                <Image
                  src="/default_user.png"
                  alt="profile"
                  width={96}
                  height={96}
                  className="rounded-full w-24 h-24 mb-4 ring-2 ring-white/10"
                />
                <h2 className="text-lg font-semibold text-slate-100 text-center">
                  {t("hello") + " "}
                  <TextType
                    text={[
                      `${user?.firstName?.charAt(0)?.toUpperCase() ?? ""}${
                        user?.firstName?.substring(1, 5) ?? ""
                      } ${user?.lastName?.charAt(0)?.toUpperCase() ?? ""}${
                        user?.lastName?.substring(1, 5) ?? ""
                      }`,
                    ]}
                    className="font-semibold text-slate-100"
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor={false}
                    cursorCharacter="|"
                  />
                </h2>
                <p className="text-sm text-slate-300/80 mb-6">
                  {t("dashboard")}
                </p>
              </div>

              <nav className="w-full flex flex-col gap-2">
                {/* Factures row */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/item/items-archives"
                    className="text-left px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    {t("invoices")}
                  </Link>
                  <Link
                    href="/invoices/create"
                    className="text-left px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    {t("newInvoice")}
                  </Link>
                </div>

                {/* Items row */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/item/item-catalogue"
                    className="text-left px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    {t("catalogue")}
                  </Link>
                  <Link
                    href="/item/creation-item"
                    className="text-left px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    {t("createItem")}
                  </Link>
                </div>

                {/* Clients row */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/clients-catalogue"
                    className="text-left px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    {t("myClients")}
                  </Link>
                  <Link
                    href="/clients-catalogue/create"
                    className="text-left px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    {t("newClient")}
                  </Link>
                </div>

                {/* Profile & FAQ row */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/profile"
                    className="text-left px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    {t("profile")}
                  </Link>
                  <Link
                    href="/pub"
                    className="text-left px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    ⭐ {t("info")}
                  </Link>
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <section className="col-span-12 lg:col-span-9 flex flex-col gap-6">
              {/* Recent invoices */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <span className="text-sky-300">📄</span> {t("recentInvoices")}
                </h3>
                {status !== "error" && isLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <Image
                      src="/image_loading.gif"
                      alt="loading"
                      width={50}
                      height={100}
                      className="object-contain max-w-full h-auto opacity-80"
                    />
                  </div>
                ) : (
                  <LastFactures rows={LastThreeFactures ?? []} />
                )}
              </div>

              {/* News */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <span className="text-sky-300">🆕</span> {t("news")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg p-4 text-center font-medium text-slate-200 border border-white/10 bg-white/5 transition-transform hover:-translate-y-1 hover:bg-white/10">
                    {t("exportPDF")}
                  </div>
                  <div className="rounded-lg p-4 text-center font-medium text-slate-200 border border-white/10 bg-white/5 transition-transform hover:-translate-y-1 hover:bg-white/10">
                    {t("onlinePayment")}
                  </div>
                  <Link
                    href="/clients-catalogue"
                    className="rounded-lg p-4 text-center font-medium text-slate-200 border border-white/10 bg-white/5 transition-transform hover:-translate-y-1 hover:bg-white/10"
                  >
                    {t("clientManagement")}
                  </Link>
                  <Link
                    href="/calendar"
                    className="rounded-lg p-4 text-center font-medium text-slate-200 border border-white/10 bg-white/5 transition-transform hover:-translate-y-1 hover:bg-white/10"
                  >
                    {t("calendar")}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
