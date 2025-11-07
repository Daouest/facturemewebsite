"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="
        w-full bg-blue-600 dark:bg-zinc-900 text-white
        border-t border-blue-700/40 dark:border-zinc-800
        /* sticky only on md+ */
        md:fixed md:bottom-0 md:left-0 md:right-0 md:z-50
      "
      aria-label="Footer"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h2 className="text-xl font-bold">FactureMe</h2>
            <p className="text-sm text-white/80">Vite fait bien fait!</p>
          </div>

          <nav aria-label="Footer navigation" className="hidden md:block">
            <Link
              href="/about"
              className="underline underline-offset-4 hover:opacity-90"
            >
              About us
            </Link>
          </nav>

          <div className="text-sm md:text-right">
            <a
              href="mailto:FactureMe25@gmail.com"
              className="underline underline-offset-4 hover:opacity-90"
            >
              FactureMe25@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
