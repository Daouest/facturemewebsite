"use client";

import { useEffect } from "react";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  useEffect(() => {
    console.error("Calendar error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950">
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-2xl font-bold text-white mb-4">
          {t("errorLoading")}
        </h2>
        <p className="text-gray-200 mb-6">
          {t("errorLoadingCalendar")}
        </p>
        <button
          onClick={reset}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}
