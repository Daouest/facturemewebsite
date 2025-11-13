"use client";

import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";

export default function DashboardLoading() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      <p className="mt-4 text-slate-300">{t("loadingDashboard")}</p>
    </div>
  );
}
