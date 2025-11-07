import Footer from "../components/footer";
import Header from "../components/Header";
import EditProfileForm from "./EditProfileForm";
import Link from "next/link";
import { AiOutlineArrowLeft } from "react-icons/ai";

export const metadata = {
  title: "Profile | FactureMe",
  description: "Modifiez votre profil",
};

export default function ProfilePage() {
  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />

        {/* Back arrow*/}
        <Link
          href="/homePage"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-colors"
          aria-label="Retour à l'accueil"
          title="Retour à l'accueil"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
        </Link>

        <main className="flex-1 pt-[80px]">
          <div className="mx-auto max-w-4xl px-6 pb-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                Profil Info
              </h1>

              {/* Divider under title */}
              <div className="my-4 border-t border-white/10" />

              <EditProfileForm />
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
