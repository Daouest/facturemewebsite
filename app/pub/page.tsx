"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import Comments from "../components/comments";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MobileSidebarWrapper from "../components/MobileSidebarWrapper";
import { data } from "@/app/lib/constante";

export default function PublicitePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxImage = 3;
  const next = () => {
    console.log("next:", currentIndex);

    setCurrentIndex((prev) =>
      prev + maxImage >= data.length ? 0 : prev + maxImage
    );
  };
  const prev = () => {
    console.log("prev:", currentIndex);

    setCurrentIndex((prev) =>
      prev - maxImage < 0
        ? Math.max(0, data.length - 1 - maxImage)
        : prev - maxImage
    );
  };

  console.log("data.slice:", currentIndex);

  const commentaires = useMemo(() => {
    return data.slice(currentIndex, currentIndex + maxImage);
  }, [currentIndex]);
  console.log("commentaires", commentaires);
  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        {/* Decorative gradient glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <main className="flex-1 pt-20 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Sidebar with Toggle */}
            <MobileSidebarWrapper>
              <Sidebar />
            </MobileSidebarWrapper>

            {/* Main Content */}
            <section className="flex-1 flex flex-col items-center">
              {/* --- Section vidéo --- */}
              <div className="w-full max-w-5xl mt-10 px-4">
                <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-100 mb-6">
                  Découvrez notre application en action
                </h1>
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-white/10">
                  <video
                    src="/FactureMe_Promo.mov"
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* --- Carrousel --- */}
              <div className="w-full mt-20 px-6">
                <h2 className="text-2xl font-semibold text-center text-slate-100 mb-8">
                  Quelques aperçus de l'application
                </h2>
                <div className="flex w-full self-start items-start overflow-hidden rounded-2xl">
                  <Comments />
                </div>
              </div>

              {/* --- Section commentaires --- */}
              <div className="w-full max-w-4xl mt-16 px-6 mb-10">
                <h2 className="text-2xl font-semibold text-center text-slate-100 mb-8">
                  Ce que disent nos utilisateurs
                </h2>
                <div className="flex flex-row items-center">
                  <AiOutlineArrowLeft
                    onClick={prev}
                    className="mr-10 cursor-pointer hover:text-sky-300 transition-colors"
                    color="white"
                    size={50}
                  />

                  <div className="grid md:grid-cols-3 gap-6">
                    {commentaires.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] transition-all hover:bg-white/10"
                      >
                        <p className="italic mb-4 text-slate-300">"{c.texte}"</p>
                        <p className="font-bold text-right text-sky-300">— {c.nom}</p>
                      </div>
                    ))}
                  </div>

                  <AiOutlineArrowRight
                    onClick={next}
                    className="ml-10 cursor-pointer hover:text-sky-300 transition-colors"
                    color="white"
                    size={50}
                  />
                </div>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
