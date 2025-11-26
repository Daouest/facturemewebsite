"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { useUser as useUserContext } from "../context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import AddressAutocomplete, { type AddressData } from "./AddressAutocomplete";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";

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
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [addressData, setAddressData] = useState<AddressData>({
    address: "",
    city: "",
    province: "",
    zipCode: "",
    country: "CA",
  });

  const { setUser } = useUserContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live availability checking
  const [availability, setAvailability] = useState<Availability>({});
  const [checking, setChecking] = useState(false);
  const [isUserIsFind, setIsUserIsFind] = useState(true);

  
  useEffect(() => {
    setIsUserIsFind(true);
  }, []);

  
  useEffect(() => {
    console.log("isUserIsFind ", isUserIsFind)

  }, [isUserIsFind])
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
          setIsUserIsFind(false);
          return;
        }

        // Clear all React Query cache to remove any stale data from previous sessions
        queryClient.clear();

        setUser({
          id: data.user.idUser,
          username: data.user.username,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          isAdmin: data.user.isAdmin,

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
      validationErrors.firstName = t("requiredName");
    if (!lastName.trim()) validationErrors.lastName = t("requiredLastName");
    if (email !== confirmEmail)
      validationErrors.confirmEmail = t("matchEmail");
    if (password !== confirmPassword)
      validationErrors.confirmPassword = t("matchPassword");

    // Address validation
    if (!addressData.address.trim())
      validationErrors["address.address"] = t("addressRequired");
    if (!addressData.city.trim())
      validationErrors["address.city"] = t("cityRequired");
    if (!addressData.province.trim())
      validationErrors["address.province"] = t("provinceRequired");
    if (!addressData.zipCode.trim())
      validationErrors["address.zipCode"] = t("postalCodeRequired");
    if (!addressData.country.trim())
      validationErrors["address.country"] = t("countryRequired");

    // If live availability says taken, reflect that before submit
    if (availability.username)
      validationErrors.username = t("alreadyUsedUsername");
    if (availability.email) validationErrors.email = t("alreadyUsedEmail");

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
          address: addressData,
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
            {mode === "login" ? t("signin") : t("signup")}
          </h2>

          {/* SIGNUP fields */}
          {mode === "signup" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <Input
                    label={t("firstName")}
                    type="text"
                    placeholder={t("firstName")}
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
                    label={t("lastName")}
                    type="text"
                    placeholder={t("lastName")}
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
                  label={t("username")}
                  type="text"
                  placeholder={t("username")}
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
                    <span className="text-xs text-zinc-500">{t("verifying")}</span>
                  )}
                  {usernameTaken && (
                    <span className="text-xs text-red-600">
                      {t("alreadyUsedUsername")}
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
                    label={t("email")}
                    type="email"
                    placeholder={t("email")}
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
                        {t("verifying")}
                      </span>
                    )}
                    {emailTaken && (
                      <span className="text-xs text-red-600">
                        {t("alreadyUsedEmail")}
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
                    label={t("confirmEmail")}
                    type="email"
                    placeholder={t("confirmEmail")}
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

              {/* Address Section */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {t("addressInformation")}
                </h3>
                <AddressAutocomplete
                  onAddressSelect={(address) => {
                    setAddressData(address);
                    // Clear address errors
                    setErrors((e) => {
                      const newErrors = { ...e };
                      delete newErrors["address.address"];
                      delete newErrors["address.city"];
                      delete newErrors["address.province"];
                      delete newErrors["address.zipCode"];
                      delete newErrors["address.country"];
                      return newErrors;
                    });
                  }}
                  initialAddress={addressData}
                  errors={{
                    address: errors["address.address"],
                    city: errors["address.city"],
                    province: errors["address.province"],
                    zipCode: errors["address.zipCode"],
                    country: errors["address.country"],
                  }}
                />
              </div>
            </>
          )}

          {/* LOGIN email */}
          {mode === "login" && (
            <Input
              label={t("email")}
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mb-5 ${!isUserIsFind ? " border-2 border-red-600" : ""}`}
              autoComplete="email"
              required
            />
          )}

          {/* Passwords */}
          {mode === "signup" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <Input
                  label={t("password")}
                  type="password"
                  placeholder={t("password")}
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
                  label={t("confirmPassword")}
                  type="password"
                  placeholder={t("confirmPassword")}
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
              label={t("password")}
              type="password"
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mb-5 ${!isUserIsFind  ? " border-2 border-red-600" : ""}`}
              required
            />
          )}

          {/* Submit */}
          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              className={`px-10 py-2 font semibold rounded-md border-gray-800 hover:bg-gray-800 hover:text-white transition-colors`}
              disabled={
                isSubmitting ||
                (mode === "signup" &&
                  (availability.email || availability.username || checking))
              }
            >
              {isSubmitting
                ? "En traitement"
                : mode === "login"
                  ? t("signin")
                  : t("signup")}
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
            {t("signupPage")}
          </Link>
        </div>
      )}
    </div>
  );
}
