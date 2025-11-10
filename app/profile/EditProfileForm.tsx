// app/profile/EditProfileForm.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import {
  ProfileInput,
  ProfileSchema,
  PasswordInput,
  PasswordSchema,
} from "../lib/schemas/profile";
import Input from "../components/Input";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";

export default function EditProfileForm() {
  const { user, setUser } = useUser();
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  const [form, setForm] = useState<ProfileInput>({
    username: user?.username ?? "",
    email: user?.email ?? "",
    firstName: (user as any)?.firstName ?? "",
    lastName: (user as any)?.lastName ?? "",
  });

  const [password, setPassword] = useState<PasswordInput>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<null | "ok" | "err">(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savedPassword, setSavedPassword] = useState<null | "ok" | "err">(null);
  const etagRef = useRef<string | null>(null); // we use __v as ETag

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) return;

        const etag = res.headers.get("ETag");
        if (etag) etagRef.current = etag;

        const data = await res.json();
        setForm({
          username: data.username ?? "",
          email: data.email ?? "",
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
        });
      } catch {
        console.log("Erreur dans le EditProfileForm (GET)");
      }
    })();
  }, []);

  const onChange =
    (key: keyof ProfileInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaved(null);

    const parsed = ProfileSchema.safeParse(form);
    if (!parsed.success) {
      console.log("Erreur de validation ProfileSchema");
      setSaved("err");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(etagRef.current ? { "If-Match": etagRef.current } : {}),
        },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Erreur lors de la sauvegarde du profil");
      }

      const etag = res.headers.get("ETag");
      if (etag) etagRef.current = etag;

      const data = await res.json();
      setSaved("ok");
      setUser?.((u) => ({ ...(u ?? {}), ...data }));
    } catch (e) {
      console.error(e);
      setSaved("err");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavedPassword(null);

    const parsed = PasswordSchema.safeParse(password);
    if (!parsed.success) {
      setSavedPassword("err");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.newPassword,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(
          j?.message || "Erreur lors du changement du mot de passe"
        );
      }

      // reset fields after success
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setSavedPassword("ok");
    } catch (e) {
      console.error(e);
      setSavedPassword("err");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Section: Infos du profil */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          {t("profileInformation")}
        </h2>
        <div className="my-4 border-t border-white/10" />

        <form
          onSubmit={saveProfile}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t("firstName")}
            </label>
            <Input
              value={form.firstName}
              onChange={onChange("firstName")}
              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t("lastName")}
            </label>
            <Input
              value={form.lastName}
              onChange={onChange("lastName")}
              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t("username")}
            </label>
            <Input
              value={form.username}
              onChange={onChange("username")}
              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t("email")}
            </label>
            <Input
              value={form.email}
              onChange={onChange("email")}
              type="email"
              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
              required
            />
          </div>

          <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
            <button
              disabled={saving}
              className="rounded-xl border border-sky-400/40 bg-sky-500/20 text-sky-200 font-medium px-4 py-2 hover:bg-sky-500/30 disabled:opacity-60 transition-colors"
              type="submit"
            >
              {saving ? t("saving") : t("save")}
            </button>
            {saved === "ok" && (
              <span className="text-green-300 text-sm">{t("saved")}</span>
            )}
            {saved === "err" && (
              <span className="text-red-300 text-sm">{t("saveError")}</span>
            )}
          </div>
        </form>
      </div>

      {/* Section: Mot de passe */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          {t("passwordSection")}
        </h2>
        <div className="my-4 border-t border-white/10" />

        <form
          onSubmit={changePassword}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t("currentPassword")}
            </label>
            <input
              value={password.currentPassword}
              onChange={(e) =>
                setPassword((p) => ({ ...p, currentPassword: e.target.value }))
              }
              type="password"
              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t("newPassword")}
            </label>
            <input
              value={password.newPassword}
              onChange={(e) =>
                setPassword((p) => ({ ...p, newPassword: e.target.value }))
              }
              type="password"
              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t("confirmPassword")}
            </label>
            <input
              value={password.confirmNewPassword}
              onChange={(e) =>
                setPassword((p) => ({
                  ...p,
                  confirmNewPassword: e.target.value,
                }))
              }
              type="password"
              className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
              required
            />
          </div>

          <div className="sm:col-span-3 mt-2 flex items-center justify-end gap-3">
            <button
              disabled={savingPassword}
              className="rounded-xl border border-sky-400/40 bg-sky-500/20 text-sky-200 font-medium px-4 py-2 hover:bg-sky-500/30 disabled:opacity-60 transition-colors"
              type="submit"
            >
              {savingPassword ? t("saving") : t("changePassword")}
            </button>
            {savedPassword === "ok" && (
              <span className="text-green-300 text-sm">
                {t("passwordChanged")}
              </span>
            )}
            {savedPassword === "err" && (
              <span className="text-red-300 text-sm">{t("passwordError")}</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
