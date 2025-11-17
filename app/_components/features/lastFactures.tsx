"use client";
import { dateToSting, createTranslator } from "@/app/_lib/utils/format";
import { TableFactureType } from "@/app/_lib/types/definitions";
import { useLangageContext } from "@/app/_context/langageContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FileText, User, Calendar, ChevronRight } from "lucide-react";
type ListFacturesProps<T extends TableFactureType> = { rows: T[] };
export function LastFactures<T extends TableFactureType>({
  rows,
}: ListFacturesProps<T>) {
  const { langage } = useLangageContext();
  const params = useParams();
  const lang = (params?.lang as string) || langage;
  const t = createTranslator(langage);
  if (rows.length == 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        {" "}
        <div className="rounded-full bg-red-500/10 p-4 mb-4">
          {" "}
          <FileText className="w-12 h-12 text-red-400" />{" "}
        </div>{" "}
        <p className="text-slate-300 font-medium text-center">
          {" "}
          {t("noFacture")}{" "}
        </p>{" "}
      </div>
    );
  }
  return (
    <div
      className={`${rows.length === 1 ? "grid grid-cols-1 gap-4 justify-center" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}`}
    >
      {" "}
      {rows.map((item, index) => (
        <Link
          href={`/${lang}/preview?factureId=${item.idFacture}`}
          key={index}
          className="group relative rounded-xl border border-white/10 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 backdrop-blur p-4 sm:p-5 shadow-lg hover:shadow-xl hover:border-sky-400/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          {" "}
          {/* Subtle gradient overlay on hover */}{" "}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/0 to-indigo-400/0 group-hover:from-sky-400/5 group-hover:to-indigo-400/5 transition-all duration-300" />{" "}
          <div className="relative z-10">
            {" "}
            {/* Customer name with icon */}{" "}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              {" "}
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                {" "}
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300" />{" "}
              </div>{" "}
              <h4 className="font-semibold text-slate-100 text-base sm:text-lg truncate">
                {" "}
                {item.nomClient}{" "}
              </h4>{" "}
            </div>{" "}
            {/* Facture number - compact on mobile */}{" "}
            <div className="flex items-center gap-2 mb-2 text-slate-300 ml-9 sm:ml-0">
              {" "}
              <FileText className="hidden sm:block w-4 h-4 text-slate-400 flex-shrink-0" />{" "}
              <p className="text-xs sm:text-sm truncate">
                {" "}
                #{item.factureNumber}{" "}
              </p>{" "}
            </div>{" "}
            {/* Date - hidden on mobile, visible on tablet+ */}{" "}
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              {" "}
              <Calendar className="w-4 h-4 flex-shrink-0" />{" "}
              <p className="text-xs">{dateToSting(item.dateFacture)}</p>{" "}
            </div>{" "}
            {/* Arrow indicator on hover */}{" "}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {" "}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />{" "}
            </div>{" "}
          </div>{" "}
        </Link>
      ))}{" "}
    </div>
  );
}
