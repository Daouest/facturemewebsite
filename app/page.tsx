"use client";

import Image from "next/image";
import AuthForm from "@/app/components/AuthForm";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Right: centered content - shows first on mobile */}
        <div className="relative flex items-center justify-center px-6 py-12 pt-24 lg:py-20 order-1 lg:order-2">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                FactureMe
              </h1>
              <p className="mt-3 text-blue-100">
                Connectez-vous pour gérer vos factures facilement.
              </p>
            </div>

            {/* Glass card for the form */}
            <div className="rounded-2xl border border-white/10 bg-white/90 shadow-xl backdrop-blur-md p-6 sm:p-8 text-zinc-900 dark:text-zinc-100">
              <AuthForm initialMode="login" />
            </div>
          </div>

          {/* background tint on the right */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-blue-950/20 to-blue-900/30" />
        </div>

        {/* Left: full-bleed image with dark overlay - shows second on mobile */}
        <div className="relative min-h-[50vh] lg:min-h-screen order-2 lg:order-1">
          <Image
            src="/construction_design.jpg"
            alt="Conception et construction"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-950/70 to-blue-950/80" />
        </div>
      </main>
      <Footer />
    </>
  );
}
