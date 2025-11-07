"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="w-full bg-blue-600 dark:bg-zinc-900 text-white border-t border-blue-700/40 dark:border-zinc-800"
      aria-label="Footer"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
          {/* Brand */}
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              FactureMe
            </h2>
            <p className="text-sm sm:text-base lg:text-lg mt-2 text-blue-50 dark:text-zinc-300">
              Vite fait bien fait!
            </p>
          </div>

          {/* About */}
          <nav className="flex flex-col" aria-label="Footer navigation">
            <h3 className="text-base font-semibold mb-2 text-white/90">
              À propos
            </h3>
            <Link
              href="/about"
              className="text-white/90 hover:text-white underline-offset-4 hover:underline transition-colors text-base sm:text-lg"
            >
              About us
            </Link>
          </nav>

          {/* Contact */}
          <div className="flex flex-col">
            <h3 className="text-base font-semibold mb-2 text-white/90">
              Contact
            </h3>
            <ul className="space-y-1 text-sm sm:text-base">
              <li>
                <a
                  href="mailto:FactureMe25@gmail.com"
                  className="text-white/90 hover:text-white underline-offset-4 hover:underline transition-colors"
                >
                  FactureMe25@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-4 border-t border-white/10 dark:border-zinc-800 text-xs sm:text-sm text-white/70 flex items-center justify-between">
          <span>
            © {new Date().getFullYear()} FactureMe. Tous droits réservés.
          </span>
          <span className="hidden sm:inline">Fait avec ❤️ au Québec.</span>
        </div>
      </div>
    </footer>
  );
}
