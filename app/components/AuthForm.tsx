"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { useUser as useUserContext } from "../context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live availability checking
  const [availability, setAvailability] = useState<Availability>({});
  const [checking, setChecking] = useState(false);

  const checkAvailability = useMemo(
    () =>
      debounce(async (emailVal: string, usernameVal: string) => {
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
          const res = await fetch(
            `/api/auth/availability?${params.toString()}`,
            {
              cache: "no-store",
            }
          );
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
      }, 400),
    []
  );

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
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setErrors(data?.errors ?? { form: data?.message ?? "Login failed" });
          return;
        }

        setUser({
          id: data.user.idUser,
          username: data.user.username,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
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

    // SIGNUP validation
    const validationErrors: Record<string, string> = {};
    if (!firstName.trim())
      validationErrors.firstName = "First name is required";
    if (!lastName.trim()) validationErrors.lastName = "Last name is required";
    if (email !== confirmEmail)
      validationErrors.confirmEmail = "Emails do not match";
    if (password !== confirmPassword)
      validationErrors.confirmPassword = "Passwords do not match";

    // If live availability says taken, reflect that before submit
    if (availability.username)
      validationErrors.username = "Username déjà utilisé";
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
        credentials: "include",
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
        // Handles both 400 (validation) and 409 (duplicate E11000)
        setErrors(
          data?.errors ?? { form: data?.message ?? "Erreur signup au form" }
        );
        return;
      }

      // success → go to check-email page
      router.replace("/auth/email/check-email");
    } catch {
      setErrors({ form: "Erreur du serveur au AuthForm" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Red borders if taken
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

          {/* SIGNUP fields */}
          {mode === "signup" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <Input
                    label="Prenom"
                    type="text"
                    placeholder="Prenom"
                    value={firstName}
                    onChange={(e) => {
                      setErrors((p) => ({ ...p, firstName: "" }));
                      setFirstName(e.target.value);
                    }}
                    required
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    label="Nom"
                    type="text"
                    placeholder="Nom"
                    value={lastName}
                    onChange={(e) => {
                      setErrors((p) => ({ ...p, lastName: "" }));
                      setLastName(e.target.value);
                    }}
                    required
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="mb-5">
                <Input
                  label="Nom d'utilisateur"
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => {
                    setErrors((p) => ({ ...p, username: "" }));
                    setUsername(e.target.value);
                  }}
                  className={`${usernameTaken ? "border-red-500" : ""}`}
                  required
                  aria-invalid={usernameTaken || !!errors.username}
                  aria-describedby="username-help"
                />
                <div
                  id="username-help"
                  className="flex items-center gap-2 mt-1"
                >
                  {checking && (
                    <span className="text-xs text-zinc-500">Vérification…</span>
                  )}
                  {usernameTaken && (
                    <span className="text-xs text-red-600">
                      Username déjà utilisé
                    </span>
                  )}
                  {errors.username && (
                    <span className="text-xs text-red-600">
                      {errors.username}
                    </span>
                  )}
                </div>
              </div>

              {/* Email + confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <Input
                    label="Courriel"
                    type="email"
                    placeholder="Courriel"
                    value={email}
                    onChange={(e) => {
                      setErrors((p) => ({ ...p, email: "" }));
                      setEmail(e.target.value);
                    }}
                    className={`${emailTaken ? "border-red-500" : ""}`}
                    required
                    aria-invalid={emailTaken || !!errors.email}
                    aria-describedby="email-help"
                    autoComplete="email"
                  />
                  <div id="email-help" className="flex items-center gap-2 mt-1">
                    {checking && (
                      <span className="text-xs text-zinc-500">
                        Vérification…
                      </span>
                    )}
                    {emailTaken && (
                      <span className="text-xs text-red-600">
                        Email déjà utilisé
                      </span>
                    )}
                    {errors.email && (
                      <span className="text-xs text-red-600">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Input
                    label="Confirmation"
                    type="email"
                    placeholder="Confirmation courriel"
                    value={confirmEmail}
                    onChange={(e) => {
                      setErrors((p) => ({ ...p, confirmEmail: "" }));
                      setConfirmEmail(e.target.value);
                    }}
                    autoComplete="email"
                    required
                  />
                  {errors.confirmEmail && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.confirmEmail}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* LOGIN email */}
          {mode === "login" && (
            <Input
              label="Courriel"
              type="email"
              placeholder="Courriel"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-5"
              autoComplete="email"
              required
            />
          )}

          {/* Passwords */}
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
              className="mb-7"
              required
            />
          )}

          {/* Submit */}
          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              className="px-10 py-2 font semibold rounded-md border-gray-800 hover:bg-gray-800 hover:text-white transition-colors"
              disabled={
                isSubmitting ||
                (mode === "signup" &&
                  (availability.email || availability.username || checking))
              }
            >
              {isSubmitting
                ? "En traitement"
                : mode === "login"
                ? "Connexion"
                : "Inscription"}
            </Button>
          </div>

          {/* Server-level form error */}
          {errors.form && (
            <p className="mt-4 text-center text-sm text-red-600">
              {errors.form}
            </p>
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
