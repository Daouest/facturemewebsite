"use client"
import { dateToSting, createTranslator } from "@/app/lib/utils";
import { TableFactureType } from "@/app/lib/definitions"
import { useLangageContext } from "../context/langageContext";

type ListFacturesProps<T extends TableFactureType> = {
    rows: T[];
}
export function LastFactures<T extends TableFactureType>({ rows }: ListFacturesProps<T>) {
    const { langage } = useLangageContext();

    const t = createTranslator(langage);

    if (rows.length == 0) {
        return (
            <div className="flex flex-row text-red-600 font-bold justify-center items-center-safe">
                <p> {t("noFacture")}</p>
            </div>
        )
    }

    return (
        <div className={ `${rows.length === 1 ? "grid grid-cols gap-4 justify-center items-center":"grid grid-cols-3 gap-4"}`}>
            {
                rows.map((item, index) => (

                    <div key={index} className="bg-blue-600 text-white rounded-xl p-4 shadow hover:scale-105 transition">
                        <h4 className="font-semibold">{t("invoice")} {item.factureNumber}</h4>
                        <p className="text-sm">Client: {item.nomClient}.</p>
                        <p className="text-sm">Date: {dateToSting(item.dateFacture)}</p>
                    </div>

                ))
            }

        </div>
    )

}