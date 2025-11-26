"use client";
//component qu'on va reutiliser dans chaque page
// *** Faire la traduction ***
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/app/context/UserContext";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LogIn } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";

export default function Header() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { langage, setLangage } = useLangageContext();
  const t = createTranslator(langage);

  const isLoggedIn = !!(user?.id || user?.username || user?.email);
  const onAboutPage = pathname === "/about";

  const changeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLangage(e.target.value as "fr" | "en");
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});

      // Clear all React Query cache to remove previous user's data
      queryClient.clear();

      setUser?.(null);
      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 shadow-sm">
      <div className="flex justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href={isLoggedIn ? "/homePage" : "/"}>
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="FactureMe"
              width={32}
              height={32}
              className="dark:invert"
            />
            <span className="text-lg font-bold text-white dark:text-gray-100">
              FactureMe
            </span>
          </div>
        </a>

        <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
          {/* Username (when logged in) */}
          {isLoggedIn && (
            <Link
              href="/profile"
              className="text-blue-400 dark:text-gray-100 text-sm sm:text-base font-medium truncate max-w-xs text-center hover:text-sky-400 transition-colors cursor-pointer"
            >
              {user?.username?.toUpperCase() ?? ""}
            </Link>
          )}

          {/* Language selector */}
          <div className="relative">
            <select
              value={langage}
              onChange={changeLang}
              className="border border-white/20 bg-white/5 text-white rounded-md px-2 py-1 text-xs sm:text-sm outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 appearance-none pr-7"
              aria-label="Choose language"
            >
              <option value="fr" className="bg-slate-900">
                FR
              </option>
              <option value="en" className="bg-slate-900">
                EN
              </option>
            </select>
            <svg
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>

          {/* When NOT logged in:
              - if on About page, show "Connexion"
              - else show "About" */}
          {!isLoggedIn &&
            (onAboutPage ? (
              <a
                href="/auth/signup"
                title={t("signin")}
                aria-label={t("signin")}
                className="inline-flex items-center justify-center rounded-md border border-white/20 p-2 text-white hover:bg-white/10 transition"
              >
                <LogIn className="h-5 w-5" />
              </a>
            ) : (
              <a
                href="/about"
                className="text-white hover:text-gray-300 dark:text-gray-300 dark:hover:text-white"
              >
                {t("aboutUs")}
              </a>
            ))}

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              disabled={loading}
              title={t("signout")}
              aria-label={t("signout")}
              className="inline-flex items-center justify-center rounded-md border border-white/20 p-2 text-white hover:bg-white/10 transition disabled:opacity-50"
              aria-busy={loading}
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
