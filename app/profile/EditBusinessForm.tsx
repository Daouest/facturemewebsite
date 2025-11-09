"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { BusinessSchema, BusinessInput } from "../lib/schemas/profile";
import Input from "../components/Input";
import Image from "next/image";

export default function EditBusinessForm() {
    const { user, setUser } = useUser();

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
        TVS: ""
    })

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
                    TVS: data.TVS ?? ""

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
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Informations de votre compagnie
                </h2>
                <div className="my-4 border-t border-gray-200" />

                <form
                    onSubmit={saveProfile}
                >
                    {/* Nom et Numéro */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom de la compagnie
                            </label>
                            <Input
                                value={form.name}
                                onChange={onChange("name")}
                                className="w-full h-11 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Numéro de compagnie
                            </label>
                            <Input
                                value={form.businessNumber}
                                onChange={onChange("businessNumber")}
                                className="w-full h-11 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                required
                            />
                        </div>
                    </div>

                    {/*Addresse*/}
                    <div id="businessAddressContainer" className="flex flex-col gap-1 bg-blue-50 rounded-xl p-4 mb-4">
                        <p className="mb-3 block font-semibold text-gray-800 flex items-center gap-2">Addresse</p>

                        {/*Premier ligne: addresse, ville*/}
                        <div className="flex flex-row w-full gap-4">
                            <div className="flex flex-row items-center w-full">
                                <label className="text-sm font-semibold text-gray-800 items-center mr-3">Addresse</label>
                                <input
                                    required
                                    placeholder="ex.: 123, rue des Alphabets"
                                    value={form.address}
                                    onChange={onChange("address")}
                                    className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div className="flex flex-row items-center w-full">
                                <label className="text-sm font-semibold text-gray-800 items-center mr-3">Ville</label>
                                <input
                                    required
                                    pattern="^[^\d]+$"
                                    placeholder="ex.: Montréal"
                                    value={form.city}
                                    onChange={onChange("city")}
                                    className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/*Seconde ligne: code postal, province, pays*/}
                        <div className="flex flex-row w-full gap-4">
                            <div className="flex flex-row items-center w-full">
                                <label className="text-sm font-semibold text-gray-800 items-center mr-3">Code postal</label>
                                <input
                                    required
                                    placeholder="ex.: A1B 2C3"
                                    value={form.zipCode}
                                    onChange={onChange("zipCode")}
                                    minLength={6}
                                    maxLength={6}
                                    pattern="^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$"
                                    className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div className="flex flex-row items-center w-1/2">
                                <label className="text-sm font-semibold text-gray-800 items-center mr-3">Province</label>
                                <Provinces
                                    value={form.province}
                                    onChange={(province) => setForm((form) => ({ ...form, province }))}
                                />
                            </div>
                            <div className="flex flex-row items-center w-1/2">
                                <label className="text-sm font-semibold text-gray-800 items-center mr-3">Pays</label>
                                <input
                                    required
                                    value="CA"
                                    disabled
                                    className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/*Logo et numéros de taxe*/}
                    <div className="flex flex-row gap-4">
                        {/* taxes */}
                        <div className="flex-1">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Numéro de TVQ
                                </label>
                                <Input
                                    value={form.TVQ}
                                    onChange={onChange("TVQ")}
                                    minLength={9}
                                    maxLength={9}
                                    className="w-full h-11 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Numéro de TVS
                                </label>
                                <Input
                                    value={form.TVS}
                                    onChange={onChange("TVS")}
                                    minLength={9}
                                    maxLength={9}
                                    className="w-full h-11 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Numéro de TVP
                                </label>
                                <Input
                                    value={form.TVP}
                                    onChange={onChange("TVP")}
                                    minLength={9}
                                    maxLength={9}
                                    className="w-full h-11 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Numéro de TVH
                                </label>
                                <Input
                                    value={form.TVH}
                                    onChange={onChange("TVH")}
                                    minLength={9}
                                    maxLength={9}
                                    className="w-full h-11 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                />
                            </div>
                        </div>

                        {/* Logo */}
                        <div className="flex-1 flex flex-col gap-4">
                            <div>
                                <label
                                    htmlFor="imageUpload"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Logo
                                </label>
                                <input
                                    className="h-11 w-full sm:flex-1 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
                                       file:mr-2 file:px-3  file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    id="imageUpload"
                                />
                            </div>
                            <div className="place-items-center">
                                <Image
                                    src={form.logo ? form.logo : "/default_image.jpg"}
                                    alt={`Logo`}
                                    width={230}
                                    height={230}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
                        <button
                            disabled={saving}
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 disabled:opacity-60 transition-colors shadow"
                            type="submit"
                        >
                            {saving ? "En traitement..." : "Modifier la compagnie"}
                        </button>
                        {saved === "ok" && (
                            <span className="text-green-700 text-sm">Sauvegardé!</span>
                        )}
                        {saved === "err" && (
                            <span className="text-red-700 text-sm">
                                Erreur dans la sauvegarde!
                            </span>
                        )}
                    </div>
                </form>
            </div >
        </div >
    );
}

export function Provinces({ value, onChange }: ProvincesProps) {
    const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'];

    return (
        <select
            id="province"
            name="provinceSelect"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            className="w-full bg-white rounded-xl border border-gray-200 py-3 pl-5 text-sm outline-none appearance-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
            {provinces.map((province) => (
                <option key={province} value={province}>
                    {province}
                </option>
            ))}
            <option value="" disabled>
                Sélectionner
            </option>
        </select>
    );
}

type ProvincesProps = {
    value: string;
    onChange: (province: string) => void;
};