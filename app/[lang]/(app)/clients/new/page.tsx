"use client";

import Form from "@/app/ui/clients-catalogue/create-form";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";
import { useParams } from "next/navigation";

export default function CreateClientPage() {
  const params = useParams();
  const lang = params?.lang as "fr" | "en";
  const { langage } = useLangageContext();
  const t = createTranslator(lang || langage);

  return (
    <section className="flex-1">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
        {/* Centered title */}
        <div className="grid grid-cols-3 items-center">
          <div className="col-span-1" />
          <h1 className="col-span-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
            {t("createClient")}
          </h1>
          <div className="col-span-1" />
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/10" />

        <Form />
      </div>
    </section>
  );
}
