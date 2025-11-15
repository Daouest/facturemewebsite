"use client";
import { useState, ReactNode } from "react";
import { Menu, X } from "lucide-react";

interface MobileSidebarWrapperProps {
  children: ReactNode;
}

export default function MobileSidebarWrapper({
  children,
}: MobileSidebarWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[60] inline-flex items-center justify-center rounded-full bg-sky-500 p-4 text-white shadow-lg hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
        aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-20 lg:top-[96px] left-0 
          h-[calc(100vh-5rem)] lg:h-auto
          w-full lg:w-auto
          transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          z-50 lg:z-auto
          lg:flex-shrink-0
          overflow-y-auto lg:overflow-visible
        `}
      >
        {children}
      </aside>
    </>
  );
}
