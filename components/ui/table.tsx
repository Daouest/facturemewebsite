"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TableItemType,
  Facture,
  HourlyRateType,
  Ticket,
} from "@/app/lib/definitions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  isTableHourlyRate,
  isTableFacture,
  isTableItem,
  dateToSting,
  formatIntoDecimal,
  createTranslator,
  showLongText,
  isTableTicket,
} from "@/app/lib/utils";
import ImageFromBd from "@/components/ui/images";
import { useLangageContext } from "@/app/context/langageContext";
// @ts-ignore
import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TableProps<T extends TableItemType | HourlyRateType | Facture | Ticket> = {
  rows: T[];
  className?: string;
  type?: "items" | "factures"|"invoicesHistories"|"archivedInvoices";
};

export function Table<T extends TableItemType | HourlyRateType | Facture | Ticket>({ rows, className, type }: TableProps<T>) {
  const [id, setId] = useState<number | null>(null);
  const [isClick, setIsClick] = useState({
    facture: false,
    ticketMessage: false,
    ticketStatus: false,
    updateFacture: false
  });
  const [messageTicket, setMessageTicket] = useState({
    client: "",
    message: "",
  });
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const router = useRouter();
  const [modalIsOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const etagRef = useRef<string | null>(null);
  const [isFetching,setIsFetching] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return; // regarde si on est côté client ou serveur
    const rootEl = document.getElementById("__next") ?? document.body;
    Modal.setAppElement(rootEl);
  }, []);

  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    const setMySession = async () => {
      const res = await fetch("/api/set-facture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ factureId: id ?? null }),
      });

      if (res.ok) {
        router.push("/previsualisation");
      } else {
        console.error("Failed to set session");
      }
    };

    if (id !== null && isClick.facture) {
      setMySession();
    }
  }, [id, isClick.facture, router]);

  const { data: tickets } = useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/api/ticket", {
        cache: "no-store",
        headers: { "if-None-Match": etagRef.current ?? "" },
      });
      const newEtag = res.headers.get("Etag");
      if (newEtag) etagRef.current = newEtag;
      if (!res.ok) throw new Error("Erreur lors de la récupération");
      return res.json();
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 8000,
  });

  const handleChangeStatus = async ({
    idClient,
    idTicket,
    status,
  }: {
    idClient: number;
    idTicket: number;
    status: boolean;
  }) => {
    const res = await fetch("/api/ticket", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idClient, idTicket, status }),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour");
    return res.json();
  };


  const handleUpdateFacture = async ({
    idFacture,
    status,
    isPaid,
  }: {
    idFacture: number;
    status: boolean;
    isPaid: boolean;
  }) => {
          setIsFetching(true);

    const res = await fetch("/api/items-archives", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idFacture, status, isPaid }),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour");
    setIsFetching(false);

    return res.json();
  };


  const mutationTicket = useMutation({
    mutationFn: handleChangeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (error) => {
      console.error("Erreur de la modification :", error);
    },
  });

  const mutationFacture = useMutation({
    mutationFn: handleUpdateFacture,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["archivedFactures"] }),
        queryClient.invalidateQueries({ queryKey: ["historiqueFactures"] }),
        queryClient.invalidateQueries({queryKey:["historiqueFactures"]})
      ])

    },
    onError: (error) => {
      console.error("Erreur de la modification d'une Facture :", error);
    },
  });

  const updateTicket = (idClient: number, idTicket: number, status: boolean) => {
    mutationTicket.mutate({ idClient, idTicket, status });
  };

  const updateFactutre = (idFacture: number, status: boolean, isPaid: boolean) => {
    mutationFacture.mutate({ idFacture, status, isPaid });
  };

  if (!rows || rows.length === 0) return null;

  // Empty state
  if (!rows || rows.length === 0) {
    return (
      <div
        className={[
          "rounded-2xl p-6 border border-dashed border-white/15 bg-white/5 backdrop-blur",
          "text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]",
        ].join(" ")}
      >
        {type === "items" ? (
          <Link
            href="/item/creation-item"
            className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-sky-500/15 ring-1 ring-sky-400/30 hover:bg-sky-500/25 transition-colors cursor-pointer"
          >
            <svg
              className="h-6 w-6 text-sky-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </Link>
        ) : (
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-sky-500/15 ring-1 ring-sky-400/30">
            <svg
              className="h-6 w-6 text-sky-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
        )}
        <p className="text-slate-200 text-base font-semibold">
          {type === "items" ? t("noItems") : t("noData")}
        </p>
        <p className="mt-1 text-sm text-slate-300/80">
          {/** Optional guidance; keep or remove */}
          {type === "items"
            ? langage === "fr"
              ? "Créez votre premier produit pour commencer."
              : "Create your first product to get started."
            : langage === "fr"
              ? "Ajoutez des éléments pour les voir apparaître ici."
              : "Add items to see them here."}
        </p>
        {type === "items" && (
          <Link
            href="/item/creation-item"
            className="mt-4 inline-flex items-center rounded-xl bg-sky-500 px-4 py-2 text-white font-medium shadow hover:bg-sky-400 transition-colors ring-1 ring-sky-400/40"
          >
            {langage === "fr" ? "Créer un produit" : "Create a product"}
          </Link>
        )}
      </div>
    );
  }

  // Determine the type to show appropriate message
  const isItems = isTableItem(rows[0]);

  // ITEMS TABLE
  if (isItems) {
    const itemRows = rows as TableItemType[];

    return (
      <div
        className={["w-full overflow-x-auto rounded-xl", className ?? ""].join(
          " "
        )}
      >
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-white/5 backdrop-blur">
              <th
                scope="col"
                className="sticky top-0 z-[1] text-left font-semibold text-slate-200 px-4 py-3 border-b border-white/10"
              >
                {t("productName")}
              </th>
              <th
                scope="col"
                className="sticky top-0 z-[1] text-left font-semibold text-slate-200 px-4 py-3 border-b border-white/10"
              >
                {t("description")}
              </th>
              <th
                scope="col"
                className="sticky top-0 z-[1] text-left font-semibold text-slate-200 px-4 py-3 border-b border-white/10"
              >
                {t("price")}
              </th>
              <th
                scope="col"
                className="sticky top-0 z-[1] text-left font-semibold text-slate-200 px-4 py-3 border-b border-white/10"
              >
                {t("image")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {itemRows.map((row) => (
              <tr
                key={row.idObjet}
                onClick={() =>
                  router.push(`/item/detail/${btoa(String(row.idObjet))}`)
                }
                className="cursor-pointer bg-white/0 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 text-slate-200 align-top">
                  {row.productName}
                </td>
                <td className="px-4 py-3 text-slate-300/90 align-top">
                  {row.description}
                </td>
                <td className="px-4 py-3 text-slate-100 align-top">
                  {formatIntoDecimal(row.price, "fr-CA", "CAD")}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="ring-1 ring-white/10 rounded-md overflow-hidden inline-block">
                    <ImageFromBd id={row.idObjet} name={row.productName} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Hourly Rates TABLE
  if (isTableHourlyRate(rows[0])) {
    const itemRows = rows as HourlyRateType[];
    return (
      <div
        className={["w-full overflow-x-auto rounded-xl", className ?? ""].join(
          " "
        )}
      >
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-white/5 backdrop-blur">
              <th
                scope="col"
                className="sticky top-0 z-[1] text-left font-semibold text-slate-200 px-4 py-3 border-b border-white/10"
              >
                {t("hourlyRateClient")}
              </th>
              <th
                scope="col"
                className="sticky top-0 z-[1] text-left font-semibold text-slate-200 px-4 py-3 border-b border-white/10"
              >
                {t("hourlyRateWorkPosition")}
              </th>
              <th
                scope="col"
                className="sticky top-0 z-[1] text-left font-semibold text-slate-200 px-4 py-3 border-b border-white/10"
              >
                {t("hourlyRateRate")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {itemRows.map((row) => (
              <tr
                key={row.idObjet}
                onClick={() =>
                  router.push(`/hourlyRates/details/${row.idObjet}`)
                } //onclick --> voir les details
                className="cursor-pointer bg-white/0 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 text-slate-200 align-top">
                  {row.clientName}
                </td>
                <td className="px-4 py-3 text-slate-200 align-top">
                  {row.workPosition}
                </td>
                <td className="px-4 py-3 text-slate-100 align-top">
                  {formatIntoDecimal(row.hourlyRate, "fr-CA", "CAD")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // FACTURES LIST
  if (isTableFacture(rows[0])) {
    const factureRows = rows as Facture[];

    if (factureRows.length === 0) {
      return (
        <p className="text-slate-200 text-base font-semibold">{t("noItems")}</p>
      );
    }
    return (
      <div className={["grid gap-3", className ?? ""].join(" ")}>
        {factureRows.map((row) => (
          <div
            key={row.idFacture}

            className={[
              "w-full text-left rounded-xl px-4 py-4",
              "border border-white/10 bg-white/5 backdrop-blur",
              "shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]",
              "hover:bg-white/10 hover:border-white/20 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-sky-400/30",
            ].join(" ")}
            aria-label={`${t("invoice")} #${row.factureNumber}`}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left: invoice number */}
              <div 
              title={t("goToPrevisualisation")}
              onClick={() => {
                setIsClick({
                  facture: true,
                  ticketMessage: false,
                  ticketStatus: false,
                  updateFacture: false
                });
                setId(row.idFacture);
              }}
                className="min-w-0 cursor cursor-pointer ">
                <h4 className="text-base font-semibold text-slate-100 truncate">
                  {t("invoice")} #{row.factureNumber}
                </h4>
              </div>

              {/* Right: meta */}
              <div className="flex flex-row items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-sky-300">
                    {row.typeFacture}
                  </p>
                </div>
                <div className="text-xs text-slate-300/80 whitespace-nowrap">
                  {dateToSting(row.dateFacture)}
                </div>
              <Button
              title={t("updateToPaidInvoice")}
                className={[
                  "text-sm font-semibold whitespace-nowrap cursor cursor-pointer",
                  row.isPaid ? "text-emerald-300" : "text-rose-300",
                  isFetching && row.idFacture === id&& "animate-pulse text-white" 
                ].join(" ")}
                onClick={() => {
                  setIsClick({
                    facture: false,
                    ticketMessage: false,
                    ticketStatus: false,
                    updateFacture: true
                  });
                  setId(row.idFacture)
                  updateFactutre(row.idFacture, row.isActive, row.isPaid)
                }
                }// change the status and put them directly to invoice history
              >
                {
                  // Show a loading label when updating this invoice, otherwise show paid/unpaid based on row.isPaid
                  isFetching && row.idFacture === id
                    ? (langage === "fr" ? "Rechargement" : "Loading")
                    : (row.isPaid ? (langage === "fr" ? "PAYÉE" : "PAID") : (langage === "fr" ? "NON PAYÉE" : "UNPAID"))
                }
              </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isTableTicket(rows[0])) {
    const ticketRows = rows as Ticket[];
    return (
      <>
        <table className="min-w-full border-separate border-spacing-0 text-sm rounded-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] bg-white/5 backdrop-blur border border-white/10">
          <thead className="bg-white/10 backdrop-blur-sm">
            <tr>
              {["Client", "Message", "Date", "Statut"].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-center text-sm font-semibold text-slate-200 border-b border-white/10"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {ticketRows.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-white/5 transition-colors text-center"
              >
                <td className="px-4 py-2 text-slate-100 font-semibold">
                  {row.nomClient}
                </td>
                <td
                  className="px-4 py-2 text-slate-300/90 hover:underline cursor-pointer"
                  onClick={() => {
                    setIsClick({
                      ...isClick,
                      ticketMessage: !isClick.ticketMessage,
                    });
                    setIsOpen(true);
                    setMessageTicket({
                      client: row.nomClient,
                      message: row.message,
                    });
                  }}
                >
                  {showLongText(row.message)}
                </td>
                <td className="px-4 py-2 text-xs text-slate-200">
                  {dateToSting(row.date)}
                </td>
                <td
                  className="px-4 py-2 text-sm cursor-pointer"
                  onClick={() => {
                    setIsClick({
                      ...isClick,
                      ticketStatus: !isClick.ticketStatus,
                    });
                    updateTicket(row.idClient, row.idTicket, !isClick.ticketStatus);
                  }}
                >
                  {row.isCompleted ? (
                    <Badge className="bg-emerald-500/80 text-white">
                      Complété
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Non complété</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isClick.ticketMessage && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className="bg-white p-6 flex flex-col rounded-xl shadow-xl max-w-md mx-auto outline-none relative z-50"
            overlayClassName="fixed inset-0 bg-black/40 flex justify-center items-center z-40"
            contentLabel="Message du ticket"
          >
            <div className="text-start font-semibold text-gray-900 mb-2">
              {messageTicket.client}:
            </div>
            <div className="text-gray-700 text-sm">{messageTicket.message}</div>
            <Button
              className="self-center mt-5 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg transition"
              onClick={closeModal}
            >
              Fermer
            </Button>
          </Modal>
        )}
      </>
    );
  }

  return null;
}
