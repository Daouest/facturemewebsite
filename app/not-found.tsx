"use client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/_lib/utils/format";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-red-500/10 p-6">
                  <FileQuestion className="w-16 h-16 text-red-400" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">
                {t("pageNotFound")}
              </h1>

              {/* Divider */}
              <div className="my-4 border-t border-white/10" />

              {/* Message */}
              <p className="text-base text-slate-300 mb-8">
                {t("pageNotFoundMessage")}
              </p>

              {/* Button */}
              <Link
                href="/homePage"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-sky-400/40 bg-sky-500/20 text-sky-200 font-medium hover:bg-sky-500/30 transition-colors"
              >
                {t("backToHome")}
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
