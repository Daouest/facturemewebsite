"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-blue-500 w-full">
      <div className="flex flex-row w-full min-h-[100px] px-3 py-4 lg:px-8 lg:py-6">
        <div className="flex-1 flex-col items-start lg:items-start mb-6 lg:mb-0 lg:w-1/4">
          <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
            FactureMe
          </h2>
          <h3 className="text-white text-sm sm:text-base lg:text-lg mt-2">
            Vite fait bien fait!
          </h3>
        </div>

        <div className="flex-1 flex-col items-center lg:items-start lg:w-1/4 mb-6 lg:mb-0">
          <Link
            href="/about"
            className="text-violet-950 text-base sm:text-lg underline mt-2"
          >
            About us
          </Link>
        </div>

        <div className="flex-1 flex-col items-center lg:items-start lg:w-1/4 mb-6 lg:mb-0">
          <p className="text-white text-base sm:text-lg underline mb-2">
            Services
          </p>
          <ul className="list-disc text-white text-sm sm:text-base pl-5">
            <li>Facturation</li>
            <li>Calendrier</li>
          </ul>
        </div>

        <div className="flex-1 flex-col items-center lg:items-start lg:w-1/4">
          <p className="text-white text-base sm:text-lg underline mb-2">
            Contact
          </p>
          <ul className="list-disc text-white text-sm sm:text-base pl-5">
            <li>Email :</li>
            <li>FactureMe25@gmail.com</li>
          </ul>
        </div>
      </div>
      <div className="flex-1 justify-center items-center border-t border-black py-2 px-2">
        <p className="text-black text-sm sm:text-base lg:text-xl font-bold text-center">
          Merci de nous avoir choisi!
        </p>
      </div>
    </footer>
  );
}
