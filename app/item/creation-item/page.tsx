"use client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
import FormCreationItem from "@/app/components/formCreationItem";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "../../context/langageContext";
import { AiOutlineArrowLeft } from "react-icons/ai";

export default function CreationPage() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />

        {/* Back arrow */}
        <Link
          href="/homePage"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          aria-label="Retour à l’accueil"
          title="Retour à l’accueil"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
          <span className="sr-only">Retour</span>
        </Link>

        <main className="flex-1 pt-[80px]">
          <div className="max-w-4xl mx-auto px-6 pb-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              {/* Title */}
              <div className="flex flex-col justify-center items-center">
                <h1 className="text-[30px] sm:text-[36px] lg:text-[35px] mt-2 sm:mt-4 font-bold text-slate-100 text-center">
                  {t("creationItem")}
                </h1>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-white/10" />

              {/* Form area */}
              <div className="mt-6 flex flex-col items-center justify-center">
                <div className="w-full lg:w-auto flex justify-center items-center">
                  <FormCreationItem />
                </div>

                {/* See items */}
                <div className="mt-6">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-xl bg-white/5 text-slate-100 hover:bg-white/10 border border-white/10 text-[18px] sm:text-[20px] lg:text-[18px]"
                  >
                    <Link href="/item/item-catalogue">{t("seeItems")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
