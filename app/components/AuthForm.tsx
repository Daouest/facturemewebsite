"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { useUser as useUserContext } from "../context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useLocalStorage from "../lib/hooks/useLocalStorage";

type AuthMode = "login" | "signup";
type AuthFormProps = { initialMode?: AuthMode };
type Availability = { email?: boolean; username?: boolean };

const debounce = <F extends (...a: any[]) => any>(fn: F, ms = 400) => {
  let t: any;
  return (...a: Parameters<F>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

export default function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { setUser } = useUserContext();
  const router = useRouter();

  // doc Record type : https://www.typescriptlang.org/docs/handbook/utility-types.html
  // façon fancy de set les messages d'erreurs par rapport aux champs de validation
  const [errors, setErrors] = useState<Record<string, string>>({ form: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(false);
  const [stopTimeout, setStopTimeout] = useState<boolean>(false);
  const [storedErrorCount, setStoredErrorCount] = useLocalStorage<number>("errorCount", 4);
  const [isUserIsFind, setIsUserIsFind] = useState(true);

  useEffect(() => {
    console.log("storedErrorCount", storedErrorCount);
    if (storedErrorCount !== 0) return;
    fetchBlock();
  }, [storedErrorCount]);

  useEffect(() => {
    setStoredErrorCount(4);
    setIsUserIsFind(true);
  }, []);

  useEffect(() => {
    setStopTimeout(false);
    if (storedErrorCount !== 0) return;

    const interval = setInterval(() => {
      expiredBlockUser(); // appel initial
      console.log("stopTimeout", stopTimeout);
      if (stopTimeout) {
        clearInterval(interval);
        return;
      }
      expiredBlockUser();
    }, 2000);

    return () => clearInterval(interval);
  }, [storedErrorCount, stopTimeout]);

  const fetchBlock = async () => {
    try {
      const res = await fetch("/api/auth/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockUser: true }),
      });
      if (!res.ok) {
        console.error("Erreur lors de la création du cookie");
        return;
      }
      console.log("Cookie de blocage défini avec succès !");
    } catch (err) {
      console.error("Erreur dans le blockage de cookie", err);
    }
  };

  const expiredBlockUser = async () => {
    let falseCount = 0;
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      console.log("data.blockUser", data.blockUser);

      if (data.blockUser === false) {
        falseCount++;
        if (falseCount >= 1) {
          console.log("dans if flaseCount", falseCount);
          setIsBlocked(false);
          setStoredErrorCount(5);
          setStopTimeout(false);
          return;
        }
      } else {
        falseCount = 0;
        setIsBlocked(true);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification du cookie", err);
    }
  };

  useEffect(() => {
    console.log("isUserIsFind ", isUserIsFind);
  }, [isUserIsFind]);

  const [availability, setAvailability] = useState<Availability>({});
  const [checking, setChecking] = useState(false);

  const checkAvailability = debounce(async (emailVal: string, usernameVal: string) => {
    const emailQ = emailVal.trim();
    const userQ = usernameVal.trim();
    if (!emailQ && !userQ) {
      setAvailability({});
      return;
    }
    setChecking(true);
    try {
      const params = new URLSearchParams();
      if (emailQ) params.set("email", emailQ);
      if (userQ) params.set("username", userQ);
      const res = await fetch(`/api/auth/availability?${params.toString()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { taken: Availability };
        setAvailability(data?.taken ?? {});
      } else {
        setAvailability({});
      }
    } catch {
      setAvailability({});
    } finally {
      setChecking(false);
    }
  }, 400);

  useEffect(() => {
    if (mode === "signup") {
      checkAvailability(email, username);
    }
  }, [email, username, mode, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (mode === "login") {
      setIsSubmitting(true);
      setIsUserIsFind(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrors({ form: data.message ?? "Erreur in login" });
          setStoredErrorCount((prev) => (prev > 1 ? prev - 1 : 0));
          setIsUserIsFind(false);
          return;
        }

        // connexion dans le context
        setIsUserIsFind(true);
        setUser({
          id: data.user.idUser,
          username: data.user.username,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          isAdmin: data.user.isAdmin,
          isOnline: data.user.isOnline,
        });

        router.replace("/homePage");
        router.refresh();
      } catch {
        setErrors({ form: "Erreur du serveur au login" });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // SIGNUP
    const validationErrors: Record<string, string> = {};
    if (!firstName.trim()) validationErrors.firstName = "First name is required";
    if (!lastName.trim()) validationErrors.lastName = "Last name is required";
    if (email !== confirmEmail) validationErrors.confirmEmail = "Emails do not match";
    if (password !== confirmPassword) validationErrors.confirmPassword = "Passwords do not match";
    if (availability.username) validationErrors.username = "Username déjà utilisé";
    if (availability.email) validationErrors.email = "Email déjà utilisé";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data?.errors ?? { form: data?.message ?? "Erreur signup au form" });
        return;
      }

      // redirect au login screen après un bon signup
      router.replace("/auth/email/check-email");
    } catch {
      setErrors({ form: "Erreur du serveur au AuthForm" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailTaken = !!availability.email;
  const usernameTaken = !!availability.username;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
          className="flex flex-col w-full p-8 rounded-lg shadow-lg bg-white dark:bg-zinc-900 dark:border dark:border-zinc-700"
        >
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
            {mode === "login" ? "Connexion" : "Inscription"}
          </h2>

          <p className="text-[12px] font-bold mb-6 text-red-600 text-center">
            {errors.form !== "" && !isUserIsFind
              ? `Il vous reste ${storedErrorCount} ${
                  storedErrorCount <= 1 ? "tentative" : "tentatives"
                }`
              : ""}
          </p>
          <p className="text-[12px] font-bold mb-6 text-red-600 text-center">
            {storedErrorCount === 0 ? `Vous avez été bloqué, revenez dans 1 minute` : ""}
          </p>

          

          {mode === "login" && (
            <Input
              label="Courriel"
              type="email"
              placeholder="Courriel"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mb-5 ${!isUserIsFind ? " border-2 border-red-600" : ""}`}
              autoComplete="email"
              disabled={isBlocked ? true : false}
              required
            />
          )}
          {mode === "signup" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => {
                    setErrors((p) => ({ ...p, password: "" }));
                    setPassword(e.target.value);
                  }}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <Input
                  label="Confirmation"
                  type="password"
                  placeholder="Confirmez mot de passe"
                  value={confirmPassword}
                  onChange={(e) => {
                    setErrors((p) => ({ ...p, confirmPassword: "" }));
                    setConfirmPassword(e.target.value);
                  }}
                  autoComplete="new-password"
                  required
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Input
              label="Mot de passe"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mb-5 ${!isUserIsFind  ? " border-2 border-red-600" : ""}`}
              disabled={isBlocked ? true : false}

              required
            />
          )}

          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              className={`px-10 py-2 font semibold rounded-md border-gray-800 hover:bg-gray-800 hover:text-white transition-colors ${
                isBlocked || isSubmitting ? "" : "cursor cursor-pointer"
              }`}
              disabled={isSubmitting || isBlocked ? true : false}
            >
              {isSubmitting
                ? "En traitement"
                : mode === "login"
                ? "Connexion"
                : "Inscription"}
            </Button>
          </div>

          {errors.form && (
            <p className="mt-4 text-center text-sm text-red-600">{errors.form}</p>
          )}
        </form>
      </div>

      {mode === "login" && (
        <div className="mt-5 text-center">
          <Link
            href="/auth/signup"
            className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 text-center underline underline-offset-4"
          >
            Page d'inscription
          </Link>
        </div>
      )}
    </div>
  );
}
