"use client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
import FormCreationItem from "@/app/components/formCreationItem";
import { useFormData } from "@/app/context/FormContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "../../context/langageContext";
import { AiOutlineArrowLeft } from "react-icons/ai";

export default function CreationPage() {
  const { formData } = useFormData();
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
        <Header />

        {/* Back arrow */}
        <Link
          href="/homePage"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Retour à l’accueil"
          title="Retour à l’accueil"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
        </Link>

        <main className="flex-1 pt-[80px]">
          <div className="max-w-4xl mx-auto px-6 pb-10">
            <div className="bg-white shadow-lg rounded-2xl p-8">
              {/* Title */}
              <div className="flex flex-col justify-center items-center">
                <h1 className="text-[30px] sm:text-[36px] lg:text-[35px] mt-2 sm:mt-4 font-bold text-gray-800 text-center">
                  {t("creationItem")}
                </h1>
              </div>

              {/* Ligne de séparation */}
              <div className="my-4 border-t border-gray-300" />

              {/* Form area */}
              <div className="mt-6 flex flex-col items-center justify-center">
                <div className="w-full lg:w-auto flex justify-center items-center">
                  <FormCreationItem />
                </div>

                {/* seeItems button moved here */}
                <div className="mt-6">
                  <Button
                    asChild
                    variant="outline"
                    className="text-[18px] sm:text-[20px] lg:text-[18px]"
                  >
                    <Link href="/item/item-catalogue">{t("seeItems")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
