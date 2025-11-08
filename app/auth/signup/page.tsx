"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/app/components/AuthForm";

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="relative min-h-screen w-full overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/construction_design.jpg"
            alt="Conception et construction"
            fill
            className="object-cover"
            priority
          />
          {/* Darker blue overlay for contrast */}
          <div className="absolute inset-0 bg-blue-950/70" />
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left intro */}
            <div className="text-white">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                FactureMe
              </h1>
              <p className="mt-4 text-lg text-blue-100 max-w-prose">
                Créez votre compte et commencez à gérer vos factures simplement.
              </p>
            </div>

            {/* Right card: your AuthForm */}
            <div className="w-full max-w-md ml-auto rounded-2xl border border-white/10 bg-white/90 shadow-xl backdrop-blur-md p-6 sm:p-8 text-zinc-900 dark:text-zinc-100">
              <AuthForm initialMode="signup" />
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 text-center">
                Déjà un compte?{" "}
                <Link href="/" className="underline underline-offset-4">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
