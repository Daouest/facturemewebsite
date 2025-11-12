"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineArrowLeft } from "react-icons/ai";

//la previsualisation represente-t-elle la facture en cours (non approuvee | session) ou une facture archivee (approuvee | BD)?
//todo.....

//informations necessaires pour la facture:..........................................................
//
//si la facture est par l'entreprise de l'utilisateur:
//      si oui, afficher les informations de l'entreprise
//      si non, afficher les informations personnelles
//afficher les informations de l'entreprise cliente
//afficher les informations de la facture (date, numero de facture, etc...)
//selon le type de facture (taux horaire, unitaire, ou mixte):
//      si taux horaire, afficher les heures travaillées et le taux horaire
//      si unitaire, afficher les quantités et le prix unitaire
//      si mixte, afficher les deux
//afficher le total de la facture (sous-total, taxes, total)
//...................................................................................................

let factureCherchee = false; // conservé (non utilisé)

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

//if logged in show previsualisation page
export default function Previsualisation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  //states
  const [factureId, setFactureId] = useState<number | null>(null); // conservé pour cohérence avec l'original
  const [facture, setFacture] = useState<any>(null);
  const [session, setSession] = useState<any>(null); //seulement besoin pour l'affichage //a retirer
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
            const errorData = await setRes.json().catch(() => ({ error: 'Unknown error' }));
            console.error("Failed to set facture in session:", setRes.status, errorData.error);
            setLoading(false);
            
            // Generic error message based on status code
            if (setRes.status === 401) {
              setError("Veuillez vous connecter pour accéder à cette facture.");
            } else if (setRes.status === 403) {
              setError("Vous n'avez pas accès à cette facture.");
            } else if (setRes.status === 404) {
              setError("Facture introuvable.");
            } else {
              setError("Impossible d'accéder à la facture. Veuillez réessayer.");
            }
            return;
          }
          setFactureId(parseInt(factureIdFromUrl)); // conserve l’intention de l’état
        }

        //1.    fetch les donnees
        const res = await fetch("/api/previsualisation");

        if (res.ok) {
          //2.    chercher les details
          const data = await res.json();
          if (data) setFacture(data);
        } else {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          console.error("Previsualisation error:", res.status, errorData.error);
          
          // Generic error message based on status code
          if (res.status === 401) {
            throw new Error("Veuillez vous connecter pour accéder à cette facture.");
          } else if (res.status === 403) {
            throw new Error("Vous n'avez pas accès à cette facture.");
          } else if (res.status === 404) {
            throw new Error("Facture introuvable.");
          } else {
            throw new Error("Échec du chargement des données de la facture.");
          }
        }
      } catch (err: any) {
        console.error("Erreur", err);
        setSession(null);
        setError(err?.message || "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };
    setAndFetchSession();
  }, [searchParams]);

  if (loading) {
    return (
      <>
        <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
          <Header />
          <main className="flex-1 flex items-center justify-center pt-[80px]">
            <div className="flex flex-col items-center px-6">
              <h1 className="text-3xl font-bold text-slate-100">
                Prévisualisation
              </h1>
              <p className="mt-4 text-slate-300/80">
                Prévisualiser vos informations avant de les imprimer.
              </p>
              <Image
                src="/Loading_Paperplane.gif"
                alt="Chargement..."
                width={200}
                height={200}
                className="object-contain max-w-full h-auto mt-4"
              />
            </div>
          </main>
        </div>

        <Footer />
      </>
    );
  }

  console.log("facture:", facture);

  const valid =
    facture &&
    facture.user &&
    facture.client &&
    facture.facture &&
    typeof facture === "object";

  if (!valid) {
    return (
      <>
        <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
          <Header />
          <main className="flex-1 flex items-center justify-center pt-[80px]">
            <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center text-slate-200 shadow mx-6">
              <h2 className="text-2xl font-semibold">
                {error ? "Erreur" : "Aucune donnée"}
              </h2>
              <p className="mt-2 text-slate-300/80">
                {error
                  ? error
                  : "Impossible d'afficher la prévisualisation pour le moment."}
              </p>
              <div className="mt-6 flex gap-3 justify-center flex-wrap">
                <Link href="/homePage">
                  <span className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-100 hover:bg-white/10">
                    Retour à l'accueil
                  </span>
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sky-200 hover:bg-sky-500/20"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </>
    );
  }

  if (facture && facture.user && facture.client && facture.facture) {
    return (
      <>
        <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
          <Header />

          {/* Back arrow */}
          <button
            onClick={() => router.back()}
            className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-colors"
            aria-label="Retour"
            title="Retour"
          >
            <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
            <span className="sr-only">Retour</span>
          </button>

          <main className="flex-1 pt-[80px] flex items-center justify-center">
            <div
              id="bigContainer"
              className="w-full max-w-5xl rounded-2xl my-8 mx-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] border border-white/10 bg-white/5 backdrop-blur"
            >
              <div className="pt-10 flex flex-col items-center px-6 sm:px-8">
                <h1 className="text-3xl font-bold text-slate-100">
                  Prévisualisation
                </h1>
                <p className="mt-2 text-slate-300/80">
                  Prévisualiser vos informations avant de les imprimer.
                </p>

                {userComponent(facture.user)}
                {clientComponent(facture.client)}
                {invoiceComponent(facture.facture)}

                <div className="mb-8 mt-4 w-full max-w-3xl flex flex-col sm:flex-row gap-3 sm:justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 text-center px-5 py-2 !rounded-xl !border !border-white/15 !bg-white/5 !text-slate-100 hover:!bg-white/10"
                    onClick={() => window.history.back()}
                  >
                    Retour
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="mt-3 text-center px-5 py-2 !rounded-xl !border !border-sky-400/40 !bg-sky-500/10 !text-sky-200 hover:!bg-sky-500/20"
                    onClick={() => router.push(`/invoices/-1/print`)}
                  >
                    Imprimer la facture
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </>
    );
  } else {
    return (
      <>
        <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div></div>
          </main>
        </div>

        <Footer />
      </>
    );
  }
}

function userComponent(infoArrayUser: any) {
  //informations de l'utilisateur ou de son entreprise
  //todo: incorporer le logo optionnel
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
        Informations de l'émetteur
      </h2>
      <div className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-lg shadow-md text-slate-100">
        <p className="mb-2">
          <span className="text-slate-300/80 mr-2">Nom:</span>{" "}
          {infoArrayUser["name"]}
        </p>
        <div className="flex flex-row gap-4 mb-2">
          <p className="mb-2 text-slate-300/80 font-medium">Addresse:</p>
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

function clientComponent(infoArrayClient: any) {
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
        Informations du client
      </h2>
      <div className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-lg shadow-md text-slate-100">
        <p className="mb-2">
          <span className="text-slate-300/80 mr-2">Nom:</span>{" "}
          {infoArrayClient["name"]}
        </p>
        <div className="flex flex-row gap-4 mb-2">
          <p className="mb-2 text-slate-300/80 font-medium">Addresse:</p>
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

function invoiceComponent(infoArray: any) {
  return (
    <div className="mt-8 w-full px-8 mb-8">
      <h2 className="text-xl font-bold mb-4 text-slate-100">
        Informations de vente
      </h2>
      <div className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-lg shadow-md text-slate-100">
        <div className="mb-4">
          <div>
            <p className="mb-2">
              <span className="text-slate-300/80 mr-2">Numero de facture:</span>{" "}
              {infoArray["factureNumber"]}
            </p>
            <div className="flex flex-row gap-4 mb-2">
              <p className="mb-2">
                <span className="text-slate-300/80 mr-2">Date:</span>{" "}
                {infoArray["date"]}
              </p>
              <p className="mb-2">
                <span className="text-slate-300/80 mr-2">Heure:</span>{" "}
                {infoArray["time"]}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 font-semibold">Numéros de taxes:</p>
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
              Détails des services
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="bg-white/5 text-slate-300">
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Poste
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Taux horaire
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Heure de début
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Heure de fin
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Pause
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Total d'heures
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
                    )
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
              Détails des produits
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="bg-white/5 text-slate-300">
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Produit
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Description
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Quantité
                    </th>
                    <th className="border border-white/10 px-4 py-2 text-left">
                      Prix unitaire
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
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-bold mb-2">Résumé</h3>
          <p className="mb-2">
            <span className="text-slate-300/80 mr-2">Sous-total:</span>
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
