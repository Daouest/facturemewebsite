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

export default function Header() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isLoggedIn = !!(user?.id || user?.username || user?.email);
  const onAboutPage = pathname === "/about";

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

        <nav className="flex items-center gap-6 text-sm font-medium">
          {/* Username (when logged in) */}
          {isLoggedIn && (
            <Link
              href="/profile"
              className="text-blue-400 dark:text-gray-100 text-sm sm:text-base font-medium truncate max-w-xs text-center hover:text-sky-400 transition-colors cursor-pointer"
            >
              {user?.username?.toUpperCase() ?? ""}
            </Link>
          )}

          {/* When NOT logged in:
              - if on About page, show "Connexion"
              - else show "About" */}
          {!isLoggedIn &&
            (onAboutPage ? (
              <a
                href="/auth/signup"
                title="Se connecter"
                aria-label="Se connecter"
                className="inline-flex items-center justify-center rounded-md border border-white/20 p-2 text-white hover:bg-white/10 transition"
              >
                <LogIn className="h-5 w-5" />
              </a>
            ) : (
              <a
                href="/about"
                className="text-white hover:text-gray-300 dark:text-gray-300 dark:hover:text-white"
              >
                About
              </a>
            ))}

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              disabled={loading}
              title="Se déconnecter"
              aria-label="Se déconnecter"
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
