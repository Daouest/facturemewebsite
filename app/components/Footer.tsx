"use client";
import Link from "next/link";
import { HelpCircle, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="w-full bg-slate-800/90 backdrop-blur border-t border-white/10 md:fixed md:bottom-0 md:left-0 md:right-0 md:z-50"
      aria-label="Footer"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-100">FactureMe</h2>
            <p className="text-sm text-slate-400">Vite fait bien fait!</p>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Footer navigation"
            className="flex gap-6 items-center"
          >
            <Link
              href="/about"
              className="text-sm text-slate-300 hover:text-sky-400 transition-colors"
            >
              About us
            </Link>
            <Link
              href="/pub"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-sky-400 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </Link>
          </nav>

          {/* Contact */}
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <a
              href="mailto:FactureMe25@gmail.com"
              className="text-sm text-slate-300 hover:text-sky-400 transition-colors"
            >
              FactureMe25@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
