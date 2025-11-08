"use client";
import React, {useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TableItemType, Facture, Ticket } from "@/app/lib/definitions";
import Modal from 'react-modal';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  isTableFacture,
  isTableItem,
  dateToSting,
  formatIntoDecimal,
  createTranslator,
  isTableTicket,
  showLongText,
} from "@/app/lib/utils";
import ImageFromBd from "@/components/ui/images";
import { useLangageContext } from "@/app/context/langageContext";

type TableProps<T extends TableItemType | Facture | Ticket> = {
  rows: T[];
  className?: string;
};

export function Table<T extends TableItemType | Facture | Ticket>({
  rows,
  className,
}: TableProps<T>) {
  const [id, setId] = useState<number | null>(null);
  const [isClick, setIsClick] = useState({ facture: false, ticketMessage: false, ticketStatus: false });
  const [messageTicket, setMessageTicket] = useState({ client: "", message: "" });
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const router = useRouter();
  const [modalIsOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const etagRef = useRef<string | null>(null);

  useEffect(() => {// setAppElement doit être exécuté après le montage sinon le DOM n'existe pas encore

    if (typeof window === "undefined") return;
    const rootEl = document.getElementById("__next") ?? document.body; //_next est un ID automatiquement ajouté par Next.js à la racine de ton application côté client.
    Modal.setAppElement(rootEl);
  }, []);



  const closeModal = () => {
    setIsOpen(false);
  }
  useEffect(() => {
    const setMySession = async () => {
      const res = await fetch("/api/set-facture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          factureId: id ?? null,
        }),
      });

      if (res.ok) {
        router.push("/previsualisation");
        console.log("Session set!");
      } else {
        console.error("Failed to set session");
      }
    };

    if (id !== null && isClick) {
      console.log("id dans le useEffect de table:", id);
      setMySession();
    }
  }, [id, isClick, router]);



  const {
    data: tickets,
  } = useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/api/ticket", {
        cache: "no-store",
        headers: {
          "if-None-Match": etagRef.current ?? "",
        },
      });
      const newEtag = res.headers.get("Etag");

      if (newEtag) etagRef.current = newEtag; console.log(" etagRef.current", etagRef.current)

      if (!res.ok) throw new Error("Erreur lors de la récupération");
      return res.json();
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 8000 //  les données son considérées comme bonne après 8 secondes

  })

  const handleChangeStatus = async ({ idClient, idTicket, status }: { idClient: number, idTicket: number, status: boolean }) => {
    const res = await fetch("/api/ticket", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idClient: idClient,
        idTicket: idTicket,
        status: status
      }),
    });
    // const data = await res.json()
    if (!res.ok) throw new Error("Erreur lors de la mise à jour");
    return res.json();
  }


  const mutation = useMutation({
    mutationFn: handleChangeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] }); // fait un relaod coté serveur
    },
    onError: (error) => {
      console.error("Erreur de la modification :", error);
    },
  });


  const update = (idClient: number, idTicket: number, status: boolean) => {

    mutation.mutate({ idClient, idTicket, status }, {
      onSuccess: () => {
        console.log("Modification complétée");
      }
    });
  }

  // Sécurité : si rows est vide, on ne rend rien
  if (!rows || rows.length === 0) return null;

  // TABLE DES ITEMS
  if (isTableItem(rows[0])) {
    const itemRows = rows as TableItemType[];
    return (
      <table
        className={`min-w-full border border-white shadow-2xl ${className ?? ""}`}
      >
        <thead className="bg-gray-300">
          <tr>
            <th className="px-8 py-4 text-left text-lg font-semibold text-black border">
              {t("productName")}
            </th>
            <th className="px-8 py-4 text-left text-lg font-semibold text-black border">
              {t("description")}
            </th>
            <th className="px-8 py-4 text-left text-lg font-semibold text-black border">
              {t("price")}
            </th>
            <th className="px-8 py-4 text-left text-lg font-semibold text-black border">
              {t("image")}
            </th>
          </tr>
        </thead>
        <tbody className="border border-white">
          {itemRows.map((row, index) => (
            <tr
              key={index}
              onClick={() =>
                router.push(`/item/detail/${btoa(String(row.idObjet))}`)
              }
              className="cursor-pointer bg-gray-50 hover:bg-gray-400 transition"
            >
              <td className="px-8 py-4 text-base text-black border">
                {row.productName}
              </td>
              <td className="px-8 py-4 text-base text-black border">
                {row.description}
              </td>
              <td className="px-8 py-4 text-base text-black border">
                {formatIntoDecimal(row.price, "fr-CA", "CAD")}
              </td>
              <td className="px-8 py-4 text-base text-black border">
                <ImageFromBd id={row.idObjet} name={row.productName} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // TABLE DES FACTURES
  if (isTableFacture(rows[0])) {
    const factureRows = rows as Facture[];
    return (
      <div className={`grid gap-4 ${className ?? ""} `}>
        {factureRows.map((row, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-xl shadow-lg bg-white hover:bg-gray-300 transition cursor-pointer"
            onClick={() => {
              setIsClick({ ...isClick, facture: true });
              setId(row.idFacture);
            }}
          >
            <div>
              <h4 className="text-lg font-semibold text-gray-800">
                {t("clientName")}: {row.nomClient}
              </h4>
              <p className="text-sm text-gray-500">
                {t("invoice")} #{row.factureNumber}
              </p>
            </div>

            <div className="lg:ml-[60%] text-right sm:flex flex-col">
              <p className="text-sm font-medium text-blue-600">
                {row.typeFacture}
              </p>
              <p className="text-xs text-gray-500">
                {dateToSting(row.dateFacture)}
              </p>
            </div>

            <div
              className={`text-sm ${row.isPaid
                ? "text-green-600"
                : "text-red-600 ml-[-30px] max-sm:text-xs"
                }`}
            >
              <p>{row.isPaid ? "PAYÉE" : "NON PAYÉE"}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (isTableTicket(rows[0])) {
    const ticketRows = rows as Ticket[];
    console.log("ticketRows",ticketRows);
    return (
      <>
        <table className="min-w-full border border-gray-300 shadow-lg rounded-xl bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Client
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Message
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Statut
              </th>
            </tr>
          </thead>

          <tbody>
            {ticketRows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-100 transition duration-200 text-center"
              >
                {/* Nom du client */}
                <td className="px-4 py-2 text-sm font-semibold text-gray-800">
                  {row.nomClient}
                  {/* Marc */}
                </td>

                {/* Message */}
                <td
                  className="px-4 py-2 text-sm text-black border-2 border-gray-100 hover:cursor-pointer"
                  onClick={() => {
                    setIsClick({ ...isClick, ticketMessage: !isClick.ticketMessage });
                    setIsOpen(true);
                    setMessageTicket({
                      ...messageTicket,
                      client: row.nomClient,
                      message: row.message,
                    });
                  }}
                >
                  {showLongText(row.message)}
                </td>

                {/* Date */}
                <td className="px-4 py-2 text-xs text-gray-500">
                  {dateToSting(row.date)}
                </td>

                {/* Statut */}
                <td
                  className="px-4 py-2 text-sm hover:cursor-pointer"
                  onClick={() => {
                    setIsClick({ ...isClick, ticketStatus: !isClick.ticketStatus });
                    update(row.idClient, row.idTicket, !isClick.ticketStatus);
                  }}
                >
                  {row.isCompleted  ? (
                    <Badge className="bg-blue-500">Complété</Badge>
                  ) : (
                    <Badge variant="destructive">Non complété</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>



        {
          isClick.ticketMessage && (
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              className="bg-white p-6 flex flex-col rounded-xl shadow-xl max-w-md mx-auto outline-none relative z-50 top-30  left-60 transform -translate-y-1/2 -translate-x-1/2"
              overlayClassName="fixed inset-0 bg-black/40 flex justify-center items-center z-40"
              contentLabel=" Modal"
            >
              <div className="text-start font-semibold">{messageTicket.client}:</div>
              <div className="text-center">{messageTicket.message}</div>
              <Button className="flex self-center mt-5 hover:cursor hover:cursor-pointer " onClick={closeModal}>Fermer</Button>

            </Modal>

          )
        }
      </>
    );
  }


  // Aucun type reconnu
  return null;
}
