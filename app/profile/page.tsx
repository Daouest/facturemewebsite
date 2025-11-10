"use client";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MobileSidebarWrapper from "../components/MobileSidebarWrapper";
import EditProfileForm from "./EditProfileForm";

export default function ProfilePage() {
  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />

        <main className="flex-1 pt-[80px]">
          <div className="mx-auto max-w-7xl px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Sidebar with Toggle */}
            <MobileSidebarWrapper>
              <Sidebar />
            </MobileSidebarWrapper>

            {/* Main Content */}
            <div className="flex-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                  Profil Info
                </h1>

                {/* Divider under title */}
                <div className="my-4 border-t border-white/10" />

                <EditProfileForm />
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
