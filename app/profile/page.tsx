"use client";
import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import EditProfileForm from "./EditProfileForm";
import EditBusinessForm from "./EditBusinessForm";
import { Menu, X } from "lucide-react";

export default function ProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />

        <main className="flex-1 pt-[80px]">
          <div className="mx-auto max-w-7xl px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Sidebar Toggle Button */}
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

            {/* Mobile backdrop */}
            {isSidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar - Slide in from left on mobile, always visible on desktop */}
            <aside
              className={`
                fixed lg:relative top-20 lg:top-0 left-0 h-[calc(100vh-5rem)] lg:h-auto
                w-64 lg:w-auto
                transform transition-transform duration-300 ease-in-out
                ${
                  isSidebarOpen
                    ? "translate-x-0"
                    : "-translate-x-full lg:translate-x-0"
                }
                z-50 lg:z-auto
                lg:flex-shrink-0
              `}
            >
              <Sidebar />
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                  Profil Info
                </h1>

                {/* Divider under title */}
                <div className="my-4 border-t border-white/10" />

                <EditProfileForm />
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
