"use client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import FormCreationItem from "@/app/components/formCreationItem";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "../../context/langageContext";

export default function CreationPage() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <>
      <Header />

      <div className="relative flex justify-center items-start pt-[80px] pb-8 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6">
        {/* soft glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <section className="flex-1">
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
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
