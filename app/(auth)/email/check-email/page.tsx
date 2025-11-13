import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vérifiez votre courriel | FactureMe",
  description:
    "Votre compte a été créé avec succès. Veuillez confirmer votre courriel pour finaliser la création de votre compte!",
};

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg p-8 text-center">
          <h1 className="text-2xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
            Votre compte a été créé avec succès
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Veuillez confirmer votre courriel pour finaliser la création de
            votre compte!
          </p>

          <Link
            href="/login"
            className="inline-block rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Retour à la page de connexion
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
