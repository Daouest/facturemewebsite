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
export default function AdminPage() {
    const [showPage, setShowPage] = useState({ tickePage: false, stats: false });
    const { user } = useUser();
    const { langage } = useLangageContext();
    const t = createTranslator(langage);
    const TickePage = React.lazy(() => import("../components/Ticket"));
    const router = useRouter()
    useEffect(() => {
        if (!user?.isAdmin) router.push("/homePage");
    }, [])
    return (
        <>
            <Header />
            <div className="relative flex justify-center items-start pt-[80px]  bg-gradient-to-r from-blue-50 via-white to-blue-100 px-6 overflow-hidden">
                <Link
                    href="/homePage"
                    className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Retour à l’accueil"
                    title="Retour à l’accueil"
                >
                    <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
                </Link>

                <div className=" h-auto w-[320px] col-span-12 lg:col-span-3 bg-[linear-gradient(45deg,_#39378a,_#041a48)] shadow-lg rounded-xl p-6 flex flex-col items-center border border-gray-100 mt-[10%] mr-10 ">
                    <Image
                        src="/default_user.png"
                        alt="profile"
                        width={96}
                        height={96}
                        className="rounded-full w-24 h-24 mb-4"
                    />
                    <h2 className="text-lg font-semibold text-white">
                        {t("hello") + " "}
                        <TextType
                            text={[
                                `${user?.firstName
                                    ?.charAt(0)
                                    .toUpperCase()}${user?.firstName?.substring(1, 5) ?? ""} ${user?.lastName?.charAt(0).toUpperCase() ?? ""
                                }${user?.lastName?.substring(1, 5) ?? ""}`
                            ]}



                            className="font-semibold"
                            typingSpeed={75}
                            pauseDuration={1500}
                            showCursor={false}
                            cursorCharacter="|"
                        />
                    </h2>
                    <p className="text-sm text-white mb-6">{t("dashboard")}</p>

                    <nav className="w-full flex flex-col gap-2 ">
                        <Button
                            variant={"ghost"}
                            className="text-center px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => {
                                setShowPage((prev) => ({ ...prev, tickePage: false,stats:false }))
                            }}
                        >
                            {t("acceuil")}
                        </Button>
                        <Button
                            variant={"ghost"}
                            className="text-center px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => { setShowPage({ ...showPage, tickePage: true }) }}
                        >
                            🧾{t("ticket")}
                        </Button>

                        <Link
                            href="/profile"
                            className="text-center px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                            {t("profile")}
                        </Link>

                        <Button
                            variant={"ghost"}
                            className="text-center px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => { setShowPage({ ...showPage, tickePage: false, stats: true }) }}
                        >
                            statistiques
                        </Button>

                    </nav>
                </div>

                <div className="relative flex flex-col gap-6 z-10 w-full max-w-7xl  mt-[5%] ">
                    {/* Sidebar */}


                    {/* Main Content */}
                    <div className="flex flex-col  w-full h-fit">

                        <p className="font-semibold text-center">{getDateNow()}</p>
                        {/* Center */}
                        <h1 className="col-span-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 text-center">
                            {t("admin_section")}
                        </h1>

                        <div className="flex flex-col  w-full h-full">
                            {showPage.tickePage && (
                                <Suspense fallback={<div className="self-center animate-pulse"> Loading...</div>}>
                                    <TickePage />
                                </Suspense>
                            )}

                            {showPage.stats && (
                                <Suspense fallback={<div className="self-center animate-pulse"> Loading...</div>}>
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