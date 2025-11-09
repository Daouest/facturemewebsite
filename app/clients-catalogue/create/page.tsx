"use client";

import { useState } from "react";
import Form from "@/app/ui/clients-catalogue/create-form";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import { Menu, X } from "lucide-react";

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />

        <main className="flex-1 pt-[80px]">
          <div className="w-full max-w-7xl mx-auto px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg hover:bg-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/50"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Backdrop for mobile sidebar */}
            {isSidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            {/* Sidebar */}
            <aside
              className={`fixed lg:relative top-20 lg:top-0 left-0 h-[calc(100vh-5rem)] lg:h-auto w-64 lg:w-auto transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              } z-50 lg:z-auto lg:flex-shrink-0`}
            >
              <Sidebar />
            </aside>

            {/* Main Content */}
            <section className="flex-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                {/* Centered title, same grid pattern as other pages */}
                <div className="grid grid-cols-3 items-center">
                  <div className="col-span-1" />
                  <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                    Créer un client
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
