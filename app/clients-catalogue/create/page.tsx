import Form from "@/app/ui/clients-catalogue/create-form";
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
import Link from "next/link";
import { AiOutlineArrowLeft } from "react-icons/ai";

export default function Page() {
  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />

        {/* Back arrow fixed under the header */}
        <Link
          href="/clients-catalogue"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-colors"
          aria-label="Retour au catalogue clients"
          title="Retour au catalogue clients"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
        </Link>

        <main className="flex-1 pt-[80px]">
          <div className="mx-auto max-w-4xl px-6 pb-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              {/* Centered title, same grid pattern as other pages */}
              <div className="grid grid-cols-3 items-center">
                <div className="col-span-1" />
                <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 text-center">
                  Créer un client
                </h1>
                <div className="col-span-1" />
              </div>

              {/* Thin divider matching other pages */}
              <div className="my-4 border-t border-white/10" />

              <Form />
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
