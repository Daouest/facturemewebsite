"use client";

import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { useUser as useUserContext } from "../context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  initialMode?: AuthMode;
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

  //doc Record type : https://www.typescriptlang.org/docs/handbook/utility-types.html
  //facon fancy de set les messages d'erreurs par rapport aux champs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    //pour tests seulement
    //effacer lorsque les tests sont complétés
    if (mode == "login") {
      console.log("Logging : ", { email, password });
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setErrors(data?.errors ?? { form: data?.message ?? "Login failed" });
          return;
        }

        //connexion dans le context
        //a checker
        setUser({
          id: data.user.idUser,
          username: data.user.username,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
        });

        //redirect vers le homepage apres la connexion
        router.replace("/homePage");
        router.refresh();
      } catch {
        setErrors({ form: "Erreur du serveur au login" });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    //ici justement on fait les verification de chaque champ
    //la constante "validationErrors" sera definie et redefinie a chaque fois
    //qu'une validation n'est pas correcte
    const validationErrors: Record<string, string> = {};
    if (!firstName.trim())
      validationErrors.firstName = "First name is required";
    if (!lastName.trim()) validationErrors.lastName = "Last name is required";
    if (email !== confirmEmail)
      validationErrors.confirmEmail = "Emails do not match";
    if (password !== confirmPassword)
      validationErrors.confirmPassword = "Passwords do not match";

    //si la longeur de l'array est plus grande que 0
    //alors, il y a une erreur quelque part dans le form.
    //Donc, on le set dans "setErrors"
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
          username,
          firstName,
          lastName,
          email,
          password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(
          data?.errors ?? { form: data?.message ?? "Erreur signup au form" }
        );
        return;
      }

      //redirect au login screen apres un bon signup
      router.replace("/auth/email/check-email");
    } catch {
      setErrors({ form: "Erreur du serveur au AuthForm" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
          className="flex flex-col w-full p-8 rounded-lg shadow-lg bg-white dark:bg-zinc-900 dark:border dark-zinc-700"
        >
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
            {mode == "login" ? "Connexion" : "Inscription"}
          </h2>

          {/* Signup field */}
          {mode == "signup" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  {/* Names */}
                  <Input
                    label="Prenom"
                    type="text"
                    placeholder="Prenom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
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
                    onChange={(e) => setLastName(e.target.value)}
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
              <Input
                label="Nom d'utilisateur"
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-5"
                required
              />

              {/* Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <Input
                    label="Courriel"
                    type="text"
                    placeholder="Courriel"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Email confirmation */}
                <div>
                  <Input
                    label="Confirmation courriel"
                    type="text"
                    placeholder="Confirmation courriel"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                  {errors.confirmEmail && (
                    <p className="mt-1 text-cs text-red-600">
                      {errors.confirmEmail}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Email au login */}
          {mode == "login" && (
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
          {mode == "signup" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <Input
                  label="Confirmer mot de passe"
                  type="password"
                  placeholder="Confirmer mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              className="px-10 py-2 font semibold rounded-md border-gray-800 hover:bg-gray-800 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "En traitement"
                : mode == "login"
                ? "Connexion"
                : "Inscription"}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-5 text-center">
        {mode === "login" ? (
          <Link
            href="/auth/signup"
            className="inline-block text-white dark:text-blue-400 font-semibold hover:underline text-base"
          >
            Page d'inscription
          </Link>
        ) : (
          <Link
            href="/"
            className="inline-block text-white dark:text-blue-400 font-semibold hover:underline text-base"
          >
            Page de connexion
          </Link>
        )}
      </div>
    </div>
  );
}
