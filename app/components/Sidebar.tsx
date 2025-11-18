"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { useLangageContext } from "../context/langageContext";
import { createTranslator, getDateNow, setCacheImage, getCacheImage } from "@/app/lib/utils";
import TextType from "./TextType";
import { Button } from "@/components/ui/button";
import { useSidebarContext } from "@/app/context/SidebarContext";

import {
  FileText,
  FilePlus,
  Package,
  PackagePlus,
  Users,
  UserPlus,
  UserCircle,
  Home,
  Calendar,
} from "lucide-react";
type SidebarProps = {
  showPageInAdmin?: boolean;
};
const urlImage = ["/default_user.png"];
export default function Sidebar({ showPageInAdmin }: SidebarProps) {
  const { langage } = useLangageContext();
  const { user } = useUser();
  const t = createTranslator(langage);
  const { setShowPage } = useSidebarContext();
  const pathname = usePathname();
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [srcImage, setSrcImage] = useState<string>();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  useEffect(() => {

    const fetchBusinessLogo = async () => {
      try {
        const response = await fetch("/api/profile/business");
        if (response.ok) {
          const data = await response.json();
          if (data.logo) {
            setBusinessLogo(data.logo);
          }
        }
      } catch (error) {
        console.error("Error fetching business logo:", error);
      }
    };
   const getImageCached = async () => {
      let cachedImage = await getCacheImage("userProfileImage");
      if (!cachedImage) {
           await setCacheImage("userProfileImage", urlImage[0]);
          cachedImage = urlImage[0];
      }
      setSrcImage(cachedImage);
    }
    if (user) {
      fetchBusinessLogo();
       getImageCached();
    }

 
  }, [user]);

  return (
    <aside className="w-full lg:w-64 lg:flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col items-center">
        <Image
          src={businessLogo ?? srcImage ?? urlImage[0]}
          alt="profile"
          width={96}
          height={96}
          className="rounded-full w-24 h-24 mb-4 ring-2 ring-white/10 object-cover"
        />
        <h2 className="text-lg font-semibold text-slate-100 text-center">
          {t("hello") + " "}
          <TextType
            text={[
              user?.firstName
                ? user.firstName.charAt(0).toUpperCase() +
                user.firstName.slice(1, 10)
                : "",
            ]}
            className="font-semibold text-slate-100"
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={false}
            cursorCharacter="|"
          />
        </h2>
        <p className="text-sm text-slate-300/80 mb-6">{t("dashboard")}</p>
      </div>

      {/* Date */}
      <div className="mb-4 pb-4 border-b border-white/10 text-center">
        <p className="text-xs text-slate-400">{getDateNow()}</p>
      </div>

      <nav className="w-full flex flex-col gap-2">
        <Link
          href="/homePage"
          className={`flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${isActive("/homePage")
              ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
              : "text-slate-200 bg-white/0 hover:bg-white/10 border-transparent hover:border-white/10"
            }`}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t("home")}</span>
        </Link>

        <Link
          href="/item/items-archives"
          className={`flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${isActive("/item/items-archives") || isActive("/invoices")
              ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
              : "text-slate-200 bg-white/0 hover:bg-white/10 border-transparent hover:border-white/10"
            }`}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t("invoices")}</span>
        </Link>

        <Link
          href="/item/item-catalogue"
          className={`flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${isActive("/item/item-catalogue") ||
              isActive("/item/creation-item") ||
              isActive("/item/detail")
              ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
              : "text-slate-200 bg-white/0 hover:bg-white/10 border-transparent hover:border-white/10"
            }`}
        >
          <Package className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t("catalogue")}</span>
        </Link>

        <Link
          href="/hourlyRates"
          className={`flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${isActive("/hourlyRates")
              ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
              : "text-slate-200 bg-white/0 hover:bg-white/10 border-transparent hover:border-white/10"
            }`}
        >
          <Package className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t("hourlyRatePage")}</span>
        </Link>

        <Link
          href="/clients-catalogue"
          className={`flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${isActive("/clients-catalogue")
              ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
              : "text-slate-200 bg-white/0 hover:bg-white/10 border-transparent hover:border-white/10"
            }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t("myClients")}</span>
        </Link>

        <Link
          href="/calendar"
          className={`flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${isActive("/calendar")
              ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
              : "text-slate-200 bg-white/0 hover:bg-white/10 border-transparent hover:border-white/10"
            }`}
        >
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t("calendar")}</span>
        </Link>

        <Link
          href="/profile"
          className={`flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${isActive("/profile")
              ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
              : "text-slate-200 bg-white/0 hover:bg-white/10 border-transparent hover:border-white/10"
            }`}
        >
          <UserCircle className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t("profile")}</span>
        </Link>

        {user?.isAdmin && (
          <>
            {!showPageInAdmin && (
              <Link
                href="/admin"
                className={`flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${isActive("/admin")
                    ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
                    : "text-slate-200 bg-white/0 hover:bg-white/10 border-transparent hover:border-white/10"
                  }`}
              >
                {t("admin_section")}
              </Link>
            )}

            {showPageInAdmin && (
              <>
                <Button
                  variant={"ghost"}
                  className="flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  onClick={() => {
                    setShowPage((prev) => ({
                      ...prev,
                      tickePage: false,
                      stats: false,
                    }));
                  }}
                >
                  {t("users")}
                </Button>
                <Button
                  variant={"ghost"}
                  className="flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  onClick={() => {
                    setShowPage((prev) => ({
                      ...prev,
                      tickePage: true,
                      stats: false,
                    }));
                  }}
                >
                  🧾{t("ticket")}
                </Button>

                <Button
                  variant={"ghost"}
                  className="flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-lg font-medium text-slate-200 transition-all duration-200 bg-white/0 hover:bg-white/10 border border-transparent hover:border-white/10"
                  onClick={() => {
                    setShowPage((prev) => ({
                      ...prev,
                      tickePage: false,
                      stats: true,
                    }));
                  }}
                >
                  statistiques
                </Button>
              </>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}
