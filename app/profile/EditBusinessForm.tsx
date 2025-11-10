"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { BusinessSchema, BusinessInput } from "../lib/schemas/profile";
import Input from "../components/Input";
import Image from "next/image";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";

export default function EditBusinessForm() {
  const { user, setUser } = useUser();
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const [form, setForm] = useState<BusinessInput>({
    //basics
    idBusiness: undefined,
    name: "",
    businessNumber: "",

    //address
    idAddress: undefined,
    address: "",
    city: "",
    zipCode: "",
    province: "",
    country: "CA",

    //optionnal
    logo: "",
    TVP: "",
    TVQ: "",
    TVH: "",
    TVS: "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<null | "ok" | "err">(null);

  //in current
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && form !== null) {
      const reader = new FileReader();

      reader.onload = () => {
        const imageBase64 = reader.result as string;
        setForm({
          ...form,
          logo: imageBase64,
        });
      };

      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile/business", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        setForm({
          //basics
          idBusiness: data.idBusiness ?? -1,
          name: data.name ?? "",
          businessNumber: data.businessNumber ?? "",

          //address
          idAddress: data.idAddress ?? -1,
          address: data.address ?? "",
          city: data.city ?? "",
          zipCode: data.zipCode ?? "",
          province: data.province ?? "",
          country: data.country ?? "CA",

          //optionnal
          logo: data.logo ?? "",
          TVP: data.TVP ?? "",
          TVQ: data.TVQ ?? "",
          TVH: data.TVH ?? "",
          TVS: data.TVS ?? "",
        });
      } catch {
        console.log("Erreur dans le EditBusinessForm (GET)");
      }
    })();
  }, []);

  const onChange =
    (key: keyof BusinessInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaved(null);

    //on assure que certaines donnees sont bien optionelles.
    const normalized = { ...form };

    // Remove IDs if they're undefined
    if (normalized.idBusiness === undefined) delete normalized.idBusiness;
    if (normalized.idAddress === undefined) delete normalized.idAddress;

    // Handle optional string fields
    const optionalFields = ["TVP", "TVQ", "TVH", "TVS", "logo"] as const;
    optionalFields.forEach((f) => {
      const value = normalized[f]?.trim() ?? "";
      if (value === "") {
        delete normalized[f];
      } else {
        normalized[f] = value;
      }
    });

    const parsed = BusinessSchema.safeParse(normalized);
    if (!parsed.success) {
      console.log("Erreur de validation BusinessSchema");
      setSaved("err");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile/business", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Erreur lors de la sauvegarde du profil");
      }

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

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Section: Infos de la compagnie */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          {t("businessInformation")}
        </h2>
        <div className="my-4 border-t border-white/10" />

        <form onSubmit={saveProfile}>
          {/* Nom et Numéro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t("companyName")}
              </label>
              <Input
                value={form.name}
                onChange={onChange("name")}
                className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t("businessNumber")}
              </label>
              <Input
                value={form.businessNumber}
                onChange={onChange("businessNumber")}
                className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
                required
              />
            </div>
          </div>
          {/*Addresse*/}
          <div
            id="businessAddressContainer"
            className="flex flex-col gap-4 rounded-xl p-4 mb-4 bg-white/5 backdrop-blur border border-white/10"
          >
            <p className="block font-semibold text-slate-100 flex items-center gap-2">
              {t("address")}
            </p>

            {/*Premier ligne: addresse, ville*/}
            <div className="flex flex-col md:flex-row w-full gap-4">
              <div className="flex flex-col w-full">
                <label className="text-sm font-semibold text-slate-300 mb-2">
                  {t("address")}
                </label>
                <input
                  required
                  placeholder={t("addressPlaceholder")}
                  value={form.address}
                  onChange={onChange("address")}
                  className="w-full bg-white/10 backdrop-blur rounded-xl border border-white/20 py-3 px-4 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="text-sm font-semibold text-slate-300 mb-2">
                  {t("city")}
                </label>
                <input
                  required
                  pattern="^[^\d]+$"
                  placeholder={t("cityPlaceholder")}
                  value={form.city}
                  onChange={onChange("city")}
                  className="w-full bg-white/10 backdrop-blur rounded-xl border border-white/20 py-3 px-4 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
            </div>

            {/*Seconde ligne: code postal, province, pays*/}
            <div className="flex flex-col sm:flex-row w-full gap-4">
              <div className="flex flex-col w-full sm:w-1/3">
                <label className="text-sm font-semibold text-slate-300 mb-2">
                  {t("postalCode")}
                </label>
                <input
                  required
                  placeholder={t("postalCodePlaceholder")}
                  value={form.zipCode}
                  onChange={onChange("zipCode")}
                  minLength={6}
                  maxLength={6}
                  pattern="^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$"
                  className="w-full bg-white/10 backdrop-blur rounded-xl border border-white/20 py-3 px-4 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
              <div className="flex flex-col w-full sm:w-1/3">
                <label className="text-sm font-semibold text-slate-300 mb-2">
                  {t("province")}
                </label>
                <Provinces
                  value={form.province}
                  onChange={(province) =>
                    setForm((form) => ({ ...form, province }))
                  }
                />
              </div>
              <div className="flex flex-col w-full sm:w-1/3">
                <label className="text-sm font-semibold text-slate-300 mb-2">
                  {t("country")}
                </label>
                <input
                  required
                  value="CA"
                  disabled
                  className="w-full bg-white/10 backdrop-blur rounded-xl border border-white/20 py-3 px-4 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 opacity-60"
                />
              </div>
            </div>
          </div>

          {/*Logo et numéros de taxe*/}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* taxes */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                {t("taxNumbers")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t("tvqNumber")}
                  </label>
                  <Input
                    value={form.TVQ}
                    onChange={onChange("TVQ")}
                    minLength={9}
                    maxLength={9}
                    placeholder="123456789"
                    className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t("tvsNumber")}
                  </label>
                  <Input
                    value={form.TVS}
                    onChange={onChange("TVS")}
                    minLength={9}
                    maxLength={9}
                    placeholder="123456789"
                    className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t("tvpNumber")}
                  </label>
                  <Input
                    value={form.TVP}
                    onChange={onChange("TVP")}
                    minLength={9}
                    maxLength={9}
                    placeholder="123456789"
                    className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t("tvhNumber")}
                  </label>
                  <Input
                    value={form.TVH}
                    onChange={onChange("TVH")}
                    minLength={9}
                    maxLength={9}
                    placeholder="123456789"
                    className="w-full h-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60"
                  />
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="flex-1 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-slate-100">
                {t("companyLogo")}
              </h3>
              <div>
                <label
                  htmlFor="imageUpload"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  {t("uploadLogo")}
                </label>
                <input
                  className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/60 
                                       file:mr-2 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-sky-500/20 file:text-sky-200 hover:file:bg-sky-500/30 file:cursor-pointer"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="imageUpload"
                />
              </div>
              <div className="flex justify-center items-center p-4 rounded-xl border border-white/10 bg-white/5">
                <Image
                  src={form.logo ? form.logo : "/default_image.jpg"}
                  alt={`Logo`}
                  width={200}
                  height={200}
                  className="rounded-lg object-contain"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              disabled={saving}
              className="w-full sm:w-auto rounded-xl border border-sky-400/40 bg-sky-500/20 text-sky-200 font-medium px-6 py-3 hover:bg-sky-500/30 disabled:opacity-60 transition-colors"
              type="submit"
            >
              {saving ? t("saving") : t("modifyCompany")}
            </button>
            {saved === "ok" && (
              <span className="text-green-300 text-sm font-medium">
                {t("saved")}
              </span>
            )}
            {saved === "err" && (
              <span className="text-red-300 text-sm font-medium">
                {t("saveError")}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
type ProvincesProps = {
  value: string;
  onChange: (province: string) => void;
};

export function Provinces({ value, onChange }: ProvincesProps) {
  const provinces = [
    "AB",
    "BC",
    "MB",
    "NB",
    "NL",
    "NS",
    "ON",
    "PE",
    "QC",
    "SK",
  ];

  return (
    <select
      id="province"
      name="provinceSelect"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full bg-white/10 backdrop-blur rounded-xl border border-white/20 py-3 pl-5 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
    >
      {provinces.map((province) => (
        <option key={province} value={province} className="bg-slate-800">
          {province}
        </option>
      ))}
      <option value="" disabled className="bg-slate-800">
        Sélectionner
      </option>
    </select>
  );
}
