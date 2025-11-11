"use client"
import React, { useState, useEffect, Suspense } from "react"
import { useUser } from "@/app/context/UserContext";
import { useLangageContext } from "../context/langageContext";
import { getDateNow, createTranslator } from "@/app/lib/utils";
import Image from "next/image";
import Header from "@/app/components/Header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AiOutlineArrowLeft } from "react-icons/ai";
import TextType from "@/app/components/TextType";
import { useRouter } from "next/navigation";
import AdminAcceuil from "@/app/components/adminAcceuil";
import StatsFactureMe from "@/app/components/stats";
import Sidebar from "../components/Sidebar";
import { useSidebarContext } from "@/app/context/SidebarContext";

export default function AdminPage() {
    const { user } = useUser();
    const { langage } = useLangageContext();
    const t = createTranslator(langage);
    const TickePage = React.lazy(() => import("../components/Ticket"));
    const router = useRouter()
  const { showPage } = useSidebarContext();

    // useEffect(() => {
    //     if (!user?.isAdmin) router.push("/homePage");
    // }, [])

    return (
        <>
            <Header />
            <div className="relative flex justify-center items-start pt-[80px]  bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 overflow-hidden">
                <Link
                    href="/homePage"
                    className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Retour à l’accueil"
                    title="Retour à l’accueil"
                >
                    <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
                </Link>

                <Sidebar showPageInAdmin={true} />

                <div className="relative flex flex-col gap-6 z-10 w-full max-w-7xl  ">

                    {/* Main Content */}
                    <div className="flex flex-col  w-full h-fit">

                        <p className="font-semibold text-center text-white">{getDateNow()}</p>
                        {/* Center */}
                        <h1 className=" text-white col-span-1 text-2xl sm:text-3xl lg:text-4xl font-semibold text-center">
                            {t("admin_section")}
                        </h1>

                        <div className="flex flex-col  w-full h-full">
                            {showPage.tickePage && (
                                <Suspense fallback={<div className="self-center animate-pulse text-white"> Loading...</div>}>
                                    <TickePage />
                                </Suspense>
                            )}

                            {showPage.stats && (
                                <Suspense fallback={<div className="self-center animate-pulse text-white"> Loading...</div>}>
                                    <StatsFactureMe />
                                </Suspense>
                            )}
                            {
                                !showPage.stats && !showPage.tickePage && (
                                        <AdminAcceuil />

                                )
                            }

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}