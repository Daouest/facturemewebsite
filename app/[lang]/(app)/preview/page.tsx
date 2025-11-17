"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/Button";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineArrowLeft } from "react-icons/ai";

// Helpers (formatage monnaie & date)
const fmtMoney = (n: number) =>
  (n ?? 0).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });

const fmtDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-CA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

export default function PreviewPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "fr";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  //states
  const [factureId, setFactureId] = useState<number | null>(null);
  const [facture, setFacture] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  //la totale useEffect
  useEffect(() => {
    const setAndFetchSession = async () => {
      // Check if factureId is in URL query params (from calendar)
      const factureIdFromUrl = searchParams.get("factureId");

      try {
        setLoading(true);
        setError(null);

        // If factureId is in URL, set it in the session first
        if (factureIdFromUrl) {
          const setRes = await fetch("/api/set-facture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ factureId: parseInt(factureIdFromUrl) }),
          });

          if (!setRes.ok) {
            const errorData = await setRes
              .json()
              .catch(() => ({ error: "Unknown error" }));
            console.error(
              "Failed to set facture in session:",
              setRes.status,
              errorData.error,
            );
            setLoading(false);

            // Generic error message based on status code
            if (setRes.status === 401) {
              setError(
                lang === "fr"
                  ? "Veuillez vous connecter pour accéder à cette facture."
                  : "Please login to access this invoice.",
              );
            } else if (setRes.status === 403) {
              setError(
                lang === "fr"
                  ? "Vous n'avez pas accès à cette facture."
                  : "You don't have access to this invoice.",
              );
            } else if (setRes.status === 404) {
              setError(
                lang === "fr" ? "Facture introuvable." : "Invoice not found.",
              );
            } else {
              setError(
                lang === "fr"
                  ? "Impossible d'accéder à la facture. Veuillez réessayer."
                  : "Unable to access invoice. Please try again.",
              );
            }
            return;
          }
          setFactureId(parseInt(factureIdFromUrl));
        }

        //1.    fetch les donnees
        const res = await fetch("/api/previsualisation");

        if (res.ok) {
          //2.    chercher les details
          const data = await res.json();
          if (data) setFacture(data);
        } else {
          const errorData = await res
            .json()
            .catch(() => ({ error: "Unknown error" }));
          console.error("Previsualisation error:", res.status, errorData.error);

          // Generic error message based on status code
          if (res.status === 401) {
            throw new Error(
              lang === "fr"
                ? "Veuillez vous connecter pour accéder à cette facture."
                : "Please login to access this invoice.",
            );
          } else if (res.status === 403) {
            throw new Error(
              lang === "fr"
                ? "Vous n'avez pas accès à cette facture."
                : "You don't have access to this invoice.",
            );
          } else if (res.status === 404) {
            throw new Error(
              lang === "fr" ? "Facture introuvable." : "Invoice not found.",
            );
          } else {
            throw new Error(
              lang === "fr"
                ? "Échec du chargement des données de la facture."
                : "Failed to load invoice data.",
            );
          }
        }
      } catch (err: any) {
        console.error("Erreur", err);
        setSession(null);
        setError(
          err?.message ||
            (lang === "fr" ? "Une erreur est survenue." : "An error occurred."),
        );
      } finally {
        setLoading(false);
      }
    };
    setAndFetchSession();
  }, [searchParams, lang]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center px-6">
          <h1 className="text-3xl font-bold text-slate-100">
            {lang === "fr" ? "Prévisualisation" : "Preview"}
          </h1>
          <p className="mt-4 text-slate-300/80">
            {lang === "fr"
              ? "Prévisualiser vos informations avant de les imprimer."
              : "Preview your information before printing."}
          </p>
          <Image
            src="/Loading_Paperplane.gif"
            alt={lang === "fr" ? "Chargement..." : "Loading..."}
            width={200}
            height={200}
            className="object-contain max-w-full h-auto mt-4"
          />
        </div>
      </div>
    );
  }

  const valid =
    facture &&
    facture.user &&
    facture.client &&
    facture.facture &&
    typeof facture === "object";

  if (!valid) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center text-slate-200 shadow">
          <h2 className="text-2xl font-semibold">
            {error
              ? lang === "fr"
                ? "Erreur"
                : "Error"
              : lang === "fr"
                ? "Aucune donnée"
                : "No data"}
          </h2>
          <p className="mt-2 text-slate-300/80">
            {error
              ? error
              : lang === "fr"
                ? "Impossible d'afficher la prévisualisation pour le moment."
                : "Unable to display preview at this time."}
          </p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Link href={`/${lang}/dashboard`}>
              <span className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-100 hover:bg-white/10">
                {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
              </span>
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sky-200 hover:bg-sky-500/20"
            >
              {lang === "fr" ? "Réessayer" : "Try again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (facture && facture.user && facture.client && facture.facture) {
    return (
      <>
        {/* Back arrow */}
        <button
          onClick={() => router.back()}
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-colors"
          aria-label={lang === "fr" ? "Retour" : "Back"}
          title={lang === "fr" ? "Retour" : "Back"}
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
          <span className="sr-only">{lang === "fr" ? "Retour" : "Back"}</span>
        </button>

        <div className="flex items-center justify-center py-8">
          <div
            id="bigContainer"
            className="w-full max-w-5xl rounded-2xl mx-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] border border-white/10 bg-white/5 backdrop-blur"
          >
            <div className="pt-10 flex flex-col items-center px-6 sm:px-8">
              <h1 className="text-3xl font-bold text-slate-100">
                {lang === "fr" ? "Prévisualisation" : "Preview"}
              </h1>
              <p className="mt-2 text-slate-300/80">
                {lang === "fr"
                  ? "Prévisualiser vos informations avant de les imprimer."
                  : "Preview your information before printing."}
              </p>

              {userComponent(facture.user, lang)}
              {clientComponent(facture.client, lang)}
              {invoiceComponent(facture.facture, lang)}

              <div className="mb-8 mt-4 w-full max-w-3xl flex flex-col sm:flex-row gap-3 sm:justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 text-center px-5 py-2 !rounded-xl !border !border-white/15 !bg-white/5 !text-slate-100 hover:!bg-white/10"
                  onClick={() => window.history.back()}
                >
                  {lang === "fr" ? "Retour" : "Back"}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  className="mt-3 text-center px-5 py-2 !rounded-xl !border !border-sky-400/40 !bg-sky-500/10 !text-sky-200 hover:!bg-sky-500/20"
                  onClick={() => router.push(`/${lang}/invoices/-1/print`)}
                >
                  {lang === "fr" ? "Imprimer la facture" : "Print invoice"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <div></div>;
  }
}

function userComponent(infoArrayUser: any, lang: string) {
  //informations de l'utilisateur ou de son entreprise
  if (
    infoArrayUser["name"] == undefined ||
    infoArrayUser["address"] == undefined ||
    infoArrayUser["city"] == undefined ||
    infoArrayUser["zipCode"] == undefined ||
    infoArrayUser["province"] == undefined
  )
    return;

  return (
    <div className="mt-8 w-full px-8 mb-8">
      <h2 className="text-xl font-bold mb-4 text-slate-100">
        {lang === "fr" ? "Informations de l'émetteur" : "Issuer information"}
      </h2>
      <div className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-lg shadow-md text-slate-100">
        <p className="mb-2">
          <span className="text-slate-300/80 mr-2">
            {lang === "fr" ? "Nom:" : "Name:"}
          </span>{" "}
          {infoArrayUser["name"]}
        </p>
        <div className="flex flex-row gap-4 mb-2">
          <p className="mb-2 text-slate-300/80 font-medium">
            {lang === "fr" ? "Addresse:" : "Address:"}
          </p>
          <div>
            <p>{infoArrayUser["address"]}</p>
            <p>{`${infoArrayUser["city"]}`}</p>
            <p>{`${infoArrayUser["zipCode"]} (${infoArrayUser["province"]})`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function clientComponent(infoArrayClient: any, lang: string) {
  if (
    infoArrayClient["name"] == undefined ||
    infoArrayClient["address"] == undefined ||
    infoArrayClient["city"] == undefined ||
    infoArrayClient["zipCode"] == undefined ||
    infoArrayClient["province"] == undefined
  )
    return;

  return (
    <div className="mt-8 w-full px-8 mb-8">
      <h2 className="text-xl font-bold mb-4 text-slate-100">
        {lang === "fr" ? "Informations du client" : "Client information"}
      </h2>
      <div className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-lg shadow-md text-slate-100">
        <p className="mb-2">
          <span className="text-slate-300/80 mr-2">
            {lang === "fr" ? "Nom:" : "Name:"}
          </span>{" "}
          {infoArrayClient["name"]}
        </p>
        <div className="flex flex-row gap-4 mb-2">
          <p className="mb-2 text-slate-300/80 font-medium">
            {lang === "fr" ? "Addresse:" : "Address:"}
          </p>
          <div>
            <p>{infoArrayClient["address"]}</p>
            <p>{`${infoArrayClient["city"]}`}</p>
            <p>{`${infoArrayClient["zipCode"]} (${infoArrayClient["province"]})`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function invoiceComponent(infoArray: any, lang: string) {
  return (
    <div className="mt-8 w-full px-8 mb-8">
      <h2 className="text-xl font-bold mb-4 text-slate-100">
        {lang === "fr" ? "Informations de vente" : "Sale information"}
      </h2>
      <div className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-lg shadow-md text-slate-100">
        <div className="mb-4">
          <div>
            <p className="mb-2">
              <span className="text-slate-300/80 mr-2">
                {lang === "fr" ? "Numero de facture:" : "Invoice number:"}
              </span>{" "}
              {infoArray["factureNumber"]}
            </p>
            <p className="mb-2">
              <span className="text-slate-300/80 mr-2">Date:</span>{" "}
              {infoArray["date"]}
            </p>
          </div>

          <div>
            <p className="mb-2 font-semibold">
              {lang === "fr" ? "Numéros de taxes:" : "Tax numbers:"}
            </p>
            {infoArray["taxesNumbers"] != undefined &&
            infoArray["taxesNumbers"].length > 0
              ? infoArray["taxesNumbers"].map((taxNum: any, index: number) => (
                  <p key={index} className="mb-2">
                    <span className="text-slate-300/80 mr-2">
                      {taxNum.taxName} Number:
                    </span>
                    <span className="font-medium">{taxNum.taxNumber}</span>
                  </p>
                ))
              : null}
          </div>
        </div>

        {infoArray["colonnesHoraire"] != undefined &&
        infoArray["colonnesHoraire"].length > 0 ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5 font-semibold">
              {lang === "fr" ? "Détails des services" : "Service details"}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="bg-white/5 text-slate-300">
                    <th className="border border-white/10 px-4 py-2 text-left">
                      {lang === "fr" ? "Poste" : "Position"}
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      {lang === "fr" ? "Taux horaire" : "Hourly rate"}
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      {lang === "fr" ? "Heure de début" : "Start time"}
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      {lang === "fr" ? "Heure de fin" : "End time"}
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      {lang === "fr" ? "Pause" : "Break"}
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      {lang === "fr" ? "Total d'heures" : "Total hours"}
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {infoArray["colonnesHoraire"].map(
                    (item: any, index: number) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-white/0" : "bg-white/5"
                        }
                      >
                        <td className="border border-white/10 px-4 py-2">
                          {item.workPosition}
                        </td>
                        <td className="border border-white/10 px-4 py-2">
                          {fmtMoney(item.hourlyRate)}
                        </td>
                        <td className="border border-white/10 px-4 py-2">
                          {fmtDateTime(item.startTime)}
                        </td>
                        <td className="border border-white/10 px-4 py-2">
                          {fmtDateTime(item.endTime)}
                        </td>
                        <td className="border border-white/10 px-4 py-2">
                          {item.lunchTimeInMinutes} mins
                        </td>
                        <td className="border border-white/10 px-4 py-2">
                          {item.totalHours} hrs
                        </td>
                        <td className="border border-white/10 px-4 py-2">
                          {fmtMoney(item.total)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {infoArray["colonnesUnitaires"] != undefined &&
        infoArray["colonnesUnitaires"].length > 0 ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5 font-semibold">
              {lang === "fr" ? "Détails des produits" : "Product details"}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="bg-white/5 text-slate-300">
                    <th className="border border-white/10 px-4 py-2 text-left">
                      {lang === "fr" ? "Produit" : "Product"}
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Description
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      {lang === "fr" ? "Quantité" : "Quantity"}
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      {lang === "fr" ? "Prix unitaire" : "Unit price"}
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {infoArray["colonnesUnitaires"].map(
                    (item: any, index: number) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-white/0" : "bg-white/5"
                        }
                      >
                        <td className="border border-white/10 px-4 py-2">
                          {item.productName}
                        </td>
                        <td className="border border-white/10 px-4 py-2">
                          {item.description}
                        </td>
                        <td className="border border-white/10 px-4 py-2">
                          {item.quantity}
                        </td>
                        <td className="border border-white/10 px-4 py-2">
                          {fmtMoney(item.pricePerUnit)}
                        </td>
                        <td className="border border-white/10 px-4 py-2">
                          {fmtMoney(item.total)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-bold mb-2">
            {lang === "fr" ? "Résumé" : "Summary"}
          </h3>
          <p className="mb-2">
            <span className="text-slate-300/80 mr-2">
              {lang === "fr" ? "Sous-total:" : "Subtotal:"}
            </span>
            <span className="font-semibold">
              {fmtMoney(infoArray["sousTotal"])}
            </span>
          </p>
          {infoArray["taxes"] != undefined && infoArray["taxes"].length > 0
            ? infoArray["taxes"].map((tax: any, index: number) => (
                <p key={index} className="mb-2">
                  <span className="text-slate-300/80 mr-2">
                    {tax.name} ({tax.rate}%):
                  </span>
                  <span className="font-semibold">{fmtMoney(tax.amount)}</span>
                </p>
              ))
            : null}
          <hr className="my-2 border-white/10" />
          <p className="mb-2 text-xl">
            <span className="text-slate-300/80 mr-2">Total:</span>
            <span className="font-bold text-sky-200">
              {fmtMoney(infoArray["total"])}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
