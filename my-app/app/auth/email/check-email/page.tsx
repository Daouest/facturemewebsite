import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";

export const metadata = {
    title: "Vérifiez votre courriel | FactureMe",
    description: "Votre compte a été créé avec succès. Veuillez confirmer votre courriel pour finaliser la création de votre compte!",
}

export default function CheckEmailPage(){
    return (
        <>
        
        <Header />
        <main className="minh-h-screen flex flex-col items-center justifiy-center px-4 pt-24">
            <div className="flex flex-col w-full max-w-md p-8 rounded-lg shadow-lg bg-white dark:bg-zinc-900 dark:border dark:border-zinc-700 text-center">
                <h1 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                    Votre compte a été créé avec succès
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Veuillez confirmer votre courriel pour finaliser la création de votre compte!
                </p>
                <a href="/" 
                    className="inline-block rounded-lg border border-gray-300 dark:border-zinc-600 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-900 dark:text-gray-100">
                    Retour à la page de connexion
                </a>
            </div>
        </main>
        <Footer />
        </>
    )
}