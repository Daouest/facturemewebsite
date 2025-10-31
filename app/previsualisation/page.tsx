"use client";

import { info } from "console";
import Header from "../components/Header";
import Footer from "../components/footer";
import Button from "../components/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

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

let factureCherchee = false;

//if logged in show previsualisation page
export default function Previsualisation() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    //states
    const [factureId, setFactureId] = useState<number | null>(null);
    const [facture, setFacture] = useState<any>(null);
    const [session, setSession] = useState<any>(null); //seulement besoin pour l'affichage //a retirer

    //la totale useEffect
    useEffect(() => {
        const setAndFetchSession = async () => {

            //utiliser ce code pour effectuer des tests de session........................
            //0.    set les donnees (doit etre enleve)
            // const res0 = await fetch('/api/set-facture', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     credentials: 'include',
            //     body: JSON.stringify({ factureId: 2 }),
            // });
            //
            // if(res0.ok){
            //............................................................................


            //1.    fetch les donnees
            try {
                setLoading(true);
                const res = await fetch('/api/previsualisation');

                if (res.ok) {
                    //2.    chercher les details
                    const data = await res.json();
                    if (data) setFacture(data)
                    
                }

            } catch (err) {
                console.error("Erreur", err)
                setSession(null);
            } finally {
                setLoading(false)
            }
            // } /* test de session */
        }
        setAndFetchSession();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-zinc-800">
                <Header />
                <div className="pt-10 flex flex-col items-center">
                    <h1 className="text-3xl font-bold">Prévisualisation</h1>
                    <p className="mt-4">Prévisualiser vos informations avant de les imprimer.</p>
                    <Image
                        src="/Loading_Paperplane.gif"
                        alt="Chargement..."
                        width={200}
                        height={200}
                        className="object-contain max-w-full h-auto"
                    />
                </div>
                <Footer />
            </main>
        );
    }

    console.log("facture:", facture);

    if (facture && facture.user && facture.client && facture.facture) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-between bg-gray-100 dark:bg-zinc-800">
                <Header />

                <div id="bigContainer" className="w-full max-w-5xl flex-grow bg-gray-50 rounded-xl mt-20 mb-8 shadow-sm">
                    <div className="pt-10 flex flex-col items-center">
                        <h1 className="text-3xl font-bold">Prévisualisation</h1>
                        <p className="mt-4">Prévisualiser vos informations avant de les imprimer.</p>
                        {userComponent(facture.user)}
                        {clientComponentonent(facture.client)}
                        {invoiceComponent(facture.facture)}
                        <div className="mb-8 flex justify-between">
                            <Button
                                type="button"
                                variant="secondary"
                                className="mt-3 block mx-auto text-center px-5 py-2"
                                onClick={() => window.history.back()}
                            >Retour</Button>
                            <Button
                                type="button"
                                variant="primary"
                                className="mt-3 block mx-auto text-center px-5 py-2"
                                onClick={() => router.push(`/invoices/-1/print`)}
                            >Imprimer la facture</Button>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        );
    } else {
        return (
            <main className="min-h-screen flex flex-col items-center justify-between bg-gray-100 dark:bg-zinc-800">
                <Header />
                <div></div>
                <Footer />
            </main>
        );
    }
}

export function userComponent(infoArrayUser: any) { //informations de l'utilisateur ou de son entreprise
    //todo: incorporer le logo optionnel
    if (infoArrayUser["name"] == undefined || infoArrayUser["address"] == undefined ||
        infoArrayUser["city"] == undefined || infoArrayUser["zipCode"] == undefined ||
        infoArrayUser["province"] == undefined) return;

    return (
        <div className="mt-8 w-full px-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Informations de l'émetteur</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="mb-2"><span className="font-semibold">Nom:</span> {infoArrayUser["name"]}</p>
                <div className="flex flex-row gap-4 mb-2">
                    <p className="mb-2"><span className="font-semibold">Addresse:</span></p>
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

export function clientComponentonent(infoArrayClient: any) {
    if (infoArrayClient["name"] == undefined || infoArrayClient["address"] == undefined ||
        infoArrayClient["city"] == undefined || infoArrayClient["zipCode"] == undefined ||
        infoArrayClient["province"] == undefined) return;

    return (
        <div className="mt-8 w-full px-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Informations du client</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="mb-2"><span className="font-semibold">Nom:</span> {infoArrayClient["name"]}</p>
                <div className="flex flex-row gap-4 mb-2">
                    <p className="mb-2"><span className="font-semibold">Addresse:</span></p>
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

export function invoiceComponent(infoArray: any) {
    return (
        <div className="mt-8 w-full px-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Informations de vente</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <div>
                        <p className="mb-2"><span className="font-semibold">Numero de facture:</span> {infoArray["factureNumber"]}</p>
                        <div className="flex flex-row gap-4 mb-2">
                            <p className="mb-2"><span className="font-semibold">Date:</span> {infoArray["date"]}</p>
                            <p className="mb-2"><span className="font-semibold">Heure:</span> {infoArray["time"]}</p>
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 font-semibold">Numéros de taxes:</p>
                        {infoArray["taxesNumbers"] != undefined && infoArray["taxesNumbers"].length > 0 ?
                            infoArray["taxesNumbers"].map((taxNum: any, index: number) => (
                                <p key={index} className="mb-2">
                                    <span className="font-semibold">{taxNum.taxName} Number:</span> {taxNum.taxNumber}
                                </p>
                            ))
                            : null
                        }
                    </div>
                </div>
                {infoArray["colonnesHoraire"] != undefined && infoArray["colonnesHoraire"].length > 0 ?
                    <div className="mt-4">
                        <h3 className="text-lg font-bold mb-2">Détails des services</h3>
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2">Poste</th>
                                    <th className="border border-gray-300 px-4 py-2">Taux horaire</th>
                                    <th className="border border-gray-300 px-4 py-2">Heure de début</th>
                                    <th className="border border-gray-300 px-4 py-2">Heure de fin</th>
                                    <th className="border border-gray-300 px-4 py-2">Pause</th>
                                    <th className="border border-gray-300 px-4 py-2">Total d'heures</th>
                                    <th className="border border-gray-300 px-4 py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {infoArray["colonnesHoraire"].map((item: any, index: number) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                                        <td className="border border-gray-300 px-4 py-2">{item.workPosition}</td>
                                        <td className="border border-gray-300 px-4 py-2">${item.hourlyRate.toFixed(2)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{new Date(item.startTime).toLocaleString("en-CA")}</td>
                                        <td className="border border-gray-300 px-4 py-2">{new Date(item.endTime).toLocaleString("en-CA")}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.lunchTimeInMinutes} mins</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.totalHours} hrs</td>
                                        <td className="border border-gray-300 px-4 py-2">${item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    : null
                }
                {infoArray["colonnesUnitaires"] != undefined && infoArray["colonnesUnitaires"].length > 0 ?
                    <div className="mt-4">
                        <h3 className="text-lg font-bold mb-2">Détails des produits</h3>
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2">Produit</th>
                                    <th className="border border-gray-300 px-4 py-2">Description</th>
                                    <th className="border border-gray-300 px-4 py-2">Quantité</th>
                                    <th className="border border-gray-300 px-4 py-2">Prix unitaire</th>
                                    <th className="border border-gray-300 px-4 py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {infoArray["colonnesUnitaires"].map((item: any, index: number) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                                        <td className="border border-gray-300 px-4 py-2">{item.productName}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                                        <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                                        <td className="border border-gray-300 px-4 py-2">${item.pricePerUnit.toFixed(2)}</td>
                                        <td className="border border-gray-300 px-4 py-2">${item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    : null
                }
                <div className="mt-4">
                    <h3 className="text-lg font-bold mb-2">Résumé</h3>
                    <p className="mb-2"><span className="font-semibold">Sous-total:</span> ${infoArray["sousTotal"].toFixed(2)}</p>
                    {infoArray["taxes"] != undefined && infoArray["taxes"].length > 0 ?
                        infoArray["taxes"].map((tax: any, index: number) => (
                            <p key={index} className="mb-2">
                                <span className="font-semibold">{tax.name} ({tax.rate}%):</span> ${tax.amount.toFixed(2)}
                            </p>
                        ))
                        : null
                    }
                    <hr className="mb-2"></hr>
                    <p className="mb-2"><span className="font-semibold">Total:</span> ${infoArray["total"].toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}