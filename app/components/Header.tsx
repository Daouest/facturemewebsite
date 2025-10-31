"use client";
//component qu'on va reutiliser dans chaque page
// *** Faire la traduction ***
import Image from "next/image";
import { useUser } from "@/app/context/UserContext";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = !!(user?.id || user?.username || user?.email);

  const onAboutPage = pathname === "/about";

  const handleLogout = async () => {
    try {
      setLoading(true);

      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
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
        {/* on doit placer le logo ici */}
        <a href="/homePage">
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

        {/* Endroit pour le username */}

        {/* Endroit pour rajouter d'autres tabs de navigation 
            Il faut remplacer les href avec les bons paths */}

        <nav className="flex items-center gap-6 text-sm font-medium">
          <div className="flex text-blue-400 dark:text-gray-100 text-sm sm:text-base font-medium truncate max-w-xs text-center">
            {user?.username?.toUpperCase() ?? ""}
          </div>
          {onAboutPage && !isLoggedIn ? (
            <a
              href="/homePage"
              className="text-white hover:text-gray-300 dark:text-gray 300 dark:hover:text-white"
            >
              Connexion
            </a>
          ) : (
            <a
              href="/about"
              className="text-white hover:text-gray-300 dark:text-gray 300 dark:hover:text-white"
            >
              About
            </a>
          )}

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              disabled={loading}
              title={"Déconnexion"}
              className="max-sm:mb-2 text-white hover:text-gray-300 dark:text-grat-300 dark:hover:text-white disable:opacity-50 cursor cursor-pointer"
              aria-busy={loading}
            >
              {loading ? "Déconnexion en cours..." : "Déconnexion"}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
