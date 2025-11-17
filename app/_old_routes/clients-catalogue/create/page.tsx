"use client";

import Form from "@/app/_components/clients/create-form";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebarWrapper from "@/app/components/MobileSidebarWrapper";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/_lib/utils/format";

export default function Page() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />

        <main className="flex-1 pt-[80px]">
          <div className="w-full max-w-7xl mx-auto px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Sidebar */}
            <MobileSidebarWrapper>
              <Sidebar />
            </MobileSidebarWrapper>

            {/* Main Content */}
            <section className="flex-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                {/* Centered title, same grid pattern as other pages */}
                <div className="grid grid-cols-3 items-center">
                  <div className="col-span-1" />
                  <h1 className="col-span-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                    {t("createClient")}
                  </h1>
                  <div className="col-span-1" />
                </div>

                {/* Thin divider matching other pages */}
                <div className="my-4 border-t border-white/10" />

                <Form />
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
