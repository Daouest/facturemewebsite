"use client";

import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/_lib/utils/format";

export default function Loading() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-4"></div>
        <p className="text-white text-xl font-semibold">
          {t("loadingHistory")}
        </p>
      </div>
    </div>
  );
}
