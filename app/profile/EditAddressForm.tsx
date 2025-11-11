"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import AddressAutocomplete, { AddressData } from "../components/AddressAutocomplete";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";
import { AddressSchema } from "../lib/schemas/auth";

export default function EditAddressForm() {
  const { user } = useUser();
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  const [addressData, setAddressData] = useState<AddressData>({
    address: "",
    city: "",
    province: "",
    zipCode: "",
    country: "CA",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<null | "ok" | "err">(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user's current address
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile/address", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        setAddressData({
          address: data.address ?? "",
          city: data.city ?? "",
          province: data.province ?? "",
          zipCode: data.zipCode ?? "",
          country: data.country ?? "CA",
        });
      } catch {
        console.log("Erreur dans le EditAddressForm (GET)");
      }
    })();
  }, []);

  const handleAddressSelect = (address: AddressData) => {
    setAddressData(address);
    setErrors({}); // Clear errors when address changes
  };

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setSaved(null);
    setErrors({});

    const parsed = AddressSchema.safeParse(addressData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setSaved("err");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile/address", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Erreur lors de la sauvegarde de l'adresse");
      }

      setSaved("ok");
    } catch (e) {
      console.error(e);
      setSaved("err");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
        {t("addressInformation")}
      </h2>
      <div className="my-4 border-t border-white/10" />

      <form onSubmit={saveAddress} className="space-y-6">
        <AddressAutocomplete
          onAddressSelect={handleAddressSelect}
          initialAddress={addressData}
          errors={errors}
          disabled={saving}
          variant="profile"
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            disabled={saving}
            className="rounded-xl border border-sky-400/40 bg-sky-500/20 text-sky-200 font-medium px-6 py-3 hover:bg-sky-500/30 disabled:opacity-60 transition-colors"
            type="submit"
          >
            {saving ? t("saving") : t("saveAddress")}
          </button>
          {saved === "ok" && (
            <span className="text-green-300 text-sm font-medium">{t("saved")}</span>
          )}
          {saved === "err" && (
            <span className="text-red-300 text-sm font-medium">{t("saveError")}</span>
          )}
        </div>
      </form>
    </div>
  );
}
