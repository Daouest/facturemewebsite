"use client";
import AuthForm from "@/app/components/AuthForm";
import Image from "next/image";
import Header from "./components/Header";
export default function Home() {
  return (
    <>
      <Header />
      <main className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
        <div className="relative min-h-[50dvh] lg:min-h-dvh">
          <Image
            src="/construction_design.jpg"
            alt="image"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex items-center justify-center px-6 py-10">
          <div className="flex w-full max-w-md flex-col items-center gap-8">
            <h1 className="text-3xl lg:text-5xl text-amber-50">FactureMe</h1>
            <AuthForm initialMode="login" />
          </div>
        </div>
      </main>
    </>
  );
}
