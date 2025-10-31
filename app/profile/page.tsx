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
      <div className="min-h-dvh flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
        <Header />

        {/* Back arrow*/}
        <Link
          href="/homePage"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Retour à l’accueil"
          title="Retour à l’accueil"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
        </Link>

        <main className="flex-1 pt-[80px]">
          <div className="mx-auto max-w-4xl px-6 pb-10">
            <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 text-center">
                Profil Info
              </h1>

              {/* Divider under title */}
              <div className="my-4 border-t border-gray-200" />

              <EditProfileForm />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
