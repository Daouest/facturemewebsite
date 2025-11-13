"use client";

import { useEffect } from "react";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold text-white mb-4">{t("errorLoading")}</h2>
      <p className="text-slate-300 mb-6">{t("errorOccurred")}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}
