"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TableItemType, Facture } from "@/app/lib/definitions";
import {
  isTableFacture,
  isTableItem,
  dateToSting,
  formatIntoDecimal,
  createTranslator,
} from "@/app/lib/utils";
import ImageFromBd from "@/components/ui/images";
import { useLangageContext } from "@/app/context/langageContext";

type TableProps<T extends TableItemType | Facture> = {
  rows: T[];
  className?: string;
};

export function Table<T extends TableItemType | Facture>({
  rows,
  className,
}: TableProps<T>) {
  const [id, setId] = useState<number | null>(null);
  const [isClick, setIsClick] = useState(false);
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  const router = useRouter();
  useEffect(() => {
    const setMySession = async () => {
      const res = await fetch("/api/set-facture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          factureId: id !== null && id !== undefined ? id : null,
        }),
      });

      const data = await res.json();

      if (data && isClick) {
        router.push("/previsualisation");
      }
      if (res.ok) {
        console.log("Session set!");
      } else {
        console.error("Failed to set session");
      }
    };
    if (id !== null && id !== undefined && isClick) {
      console.log("id dans le useEffect de table:", id);
      setMySession();
    }
  }, [id]);

  if (!rows || rows.length === 0) {
    return (
      <div className=" h-[200px] w-full">
        <p className="flex mt-20 text-red-600 text-2xl font-bold justify-center items-center">
          {t("noData")}
        </p>
      </div>
    );
  }

  if (isTableItem(rows[0])) {
    const itemRows = rows as TableItemType[];
    return (
      <table
        className={`min-w-full border border-white shadow-2xl ${
          className ?? ""
        }`}
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
              onClick={() => router.push(`/item/detail/${row.idObjet}`)}
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
  } else if (isTableFacture(rows[0])) {
    const factureRows = rows as Facture[];
    return (
      <div className={`grid gap-4 ${className ?? ""}`}>
        {factureRows.map((row, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-xl shadow-lg bg-white  hover:bg-gray-300 transition cursor cursor-pointer"
            onClick={() => {
              setIsClick(true);
              setId(row.idFacture);
            }}
          >
            <div>
              <h4 className="text-lg font-semibold text-gray-800 ">
                {t("clientName")}: {row.nomClient}
              </h4>
              <p className="text-sm text-gray-500">
                {t("invoice")} #{row.factureNumber}
              </p>
            </div>
    <div className="flex flex-row gap-8 px-4 py-4 lg:gap-10 lg:px-16  ">
              <div className="lg:ml-[60%]  text-right sm:flex flex-col">
                <p className="text-sm font-medium text-blue-600">
                  {row.typeFacture}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {dateToSting(row.dateFacture)}
                </p>
              </div>
              <div
                className={`text-sm ${
                  row.isPaid
                    ? "text-green-600"
                    : "text-red-600 ml-[-30px] max-sm:text-xs"
                }`}
              >
                <p>{row.isPaid ? "PAYÉE" : "NON PAYÉE"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
