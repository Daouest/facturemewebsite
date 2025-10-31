import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-24">
        <div className="flex flex-col w-full max-w-md p-8 rounded-lg shadow-lg bg-white dark:bg-zinc-900 dark:border dark:border-zinc-700 text-center">
          <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Page non-trouvé
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Cette page n'existe pas! Avez-vous le bon lien?
          </p>
          <a
            href="/homePage"
            className="inline-block rounded-lg border border-gray-300 dark:border-zinc-600 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-900 dark:text-gray-100"
          >
            Retour à l'accueil
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
