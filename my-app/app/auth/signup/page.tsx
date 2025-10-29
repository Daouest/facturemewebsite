"use client";

import AuthForm from "@/app/components/AuthForm";
import Footer from "@/app/components/footer";
import Header from "@/app/components/Header";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function SignupPage() {
  return (
    <>
      <Header />
      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        <Image
          src="/construction_design.jpg"
          alt="image"
          width={100}
          height={100}
          className=" object-contain w-full  h-full"
        />
        <div className="flex flex-col w-full h-full items-center justify-start  p-6 mt-[10%] gap-10">
          <h1 className="text-4xl lg:text-6xl font-bold text-white dark:text-gray-100">
            FactureMe
          </h1>

          <AuthForm initialMode="signup" />
        </div>
      </div>
    </>
  );
}
