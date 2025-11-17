"use client";

import FormCreationHourlyRate from "@/app/components/FormCreationHourlyRate";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createTranslator } from "@/app/_lib/utils/format";
import { useLangageContext } from "@/app/context/langageContext";
import { useParams } from "next/navigation";

export default function CreateRatePage() {
  const params = useParams();
  const lang = params?.lang as "fr" | "en";
  const { langage } = useLangageContext();
  const t = createTranslator(lang || langage);

  return (
    <section className="flex-1">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
        {/* Title */}
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-[30px] sm:text-[36px] lg:text-[35px] mt-2 sm:mt-4 font-bold text-slate-100 text-center">
            {t("creationHourlyRate")}
          </h1>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/10" />

        {/* Form area */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <div className="w-full lg:w-auto flex justify-center items-center">
            <FormCreationHourlyRate />
          </div>

          {/* See items */}
          <div className="mt-6">
            <Button
              asChild
              variant="outline"
              className="rounded-xl bg-white/5 text-slate-100 hover:bg-white/10 border border-white/10 text-[18px] sm:text-[20px] lg:text-[18px]"
            >
              <Link href={`/${lang}/rates`}>{t("seeHourlyRates")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
