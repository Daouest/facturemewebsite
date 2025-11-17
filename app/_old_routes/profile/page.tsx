"use client";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MobileSidebarWrapper from "../components/MobileSidebarWrapper";
import EditProfileForm from "./EditProfileForm";
import EditBusinessForm from "./EditBusinessForm";
import EditAddressForm from "./EditAddressForm";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/_lib/utils/format";

export default function ProfilePage() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        <main className="flex-1 pt-[80px] pb-32 md:pb-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Sidebar with Toggle */}
            <MobileSidebarWrapper>
              <Sidebar />
            </MobileSidebarWrapper>

            {/* Main Content */}
            <div className="flex-1 w-full">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-100 text-center mb-4">
                  {t("profileInfo")}
                </h1>

                {/* Divider under title */}
                <div className="mb-6 border-t border-white/10" />

                <EditProfileForm />

                {/* Divider between sections */}
                <div className="my-8 border-t border-white/10" />

                <EditAddressForm />

                {/* Divider between sections */}
                <div className="my-8 border-t border-white/10" />

                <EditBusinessForm />
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
