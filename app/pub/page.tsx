"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import Comments from "../components/comments";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { data } from "@/app/_lib/utils/constants";

export default function PublicitePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxImage = 3;
  const next = () => {
    console.log("next:", currentIndex);

    setCurrentIndex((prev) =>
      prev + maxImage >= data.length ? 0 : prev + maxImage,
    );
  };
  const prev = () => {
    console.log("prev:", currentIndex);

    setCurrentIndex((prev) =>
      prev - maxImage < 0
        ? Math.max(0, data.length - 1 - maxImage)
        : prev - maxImage,
    );
  };

  console.log("data.slice:", currentIndex);

  const commentaires = useMemo(() => {
    return data.slice(currentIndex, currentIndex + maxImage);
  }, [currentIndex]);
  console.log("commentaires", commentaires);
  return (
    <>
      <Header />
      <div className="text-white flex flex-col items-center justify-center mt-20">
        {/* --- Section vidéo --- */}
        <section className="w-full max-w-5xl mt-10 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Découvrez notre application en action
          </h1>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
            <video
              src="/facture_video.mp4"
              controls
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* --- Carrousel --- */}
        <section className=" fle w-full mt-20 px-6">
          <h2 className="flex x flex-col justify-center items-center text-2xl font-semibold text-center mb-8">
            Quelques aperçus de l’application
          </h2>
          <div className="flex w-full self-start items-start overflow-hidden rounded-2xl">
            <Comments />
          </div>
        </section>

        {/* --- Section commentaires --- */}
        <section className="w-full  max-w-4xl mt-16 px-6 mb-10">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Ce que disent nos utilisateurs
          </h2>
          <div className="flex flex-row">
            <AiOutlineArrowLeft
              onClick={prev}
              className=" mr-10 cursoir cursor-pointer"
              color="white"
              size={50}
            />

            <div className="grid md:grid-cols-3 gap-6">
              {commentaires.map((c, i) => (
                <div
                  key={i}
                  className="bg-white text-[#0a1a3c] rounded-2xl p-6 shadow-md transition-transform hover:scale-105"
                >
                  <p className="italic mb-4">“{c.texte}”</p>
                  <p className="font-bold text-right">— {c.nom}</p>
                </div>
              ))}
            </div>

            <AiOutlineArrowRight
              onClick={next}
              className=" ml-10 cursoir cursor-pointer"
              color="white"
              size={50}
            />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
