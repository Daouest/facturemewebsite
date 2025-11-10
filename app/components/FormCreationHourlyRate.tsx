"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AiOutlineAlert } from "react-icons/ai";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFormData } from "@/app/context/HourlyRateFormContext";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "@/app/context/langageContext";

export default function FormCreationHourlyRate() {
    // Traduction
    const { langage } = useLangageContext();
    const t = createTranslator(langage);

    // Form
    const { formData, setFormData } = useFormData();
    const { user } = useUser();
    const router = useRouter();
    const [hourlyRate, setHourlyRate] = useState<string>("");

    // Errors handling
    const [Errormessage, setErrorMessage] = useState({
        error: false,
        message: "",
    });
    const [showAlert, setShowAlert] = useState(false);

    // On change, for the form and its input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Formatter le taux horaire ($)
        if (name === "hourlyRate") {
            const rawValue = value.replace(/\s/g, "").replace(",", ".");
            if (rawValue === "." || /^\d+\.$/.test(rawValue)) {
                setHourlyRate(rawValue.replace(".", ","));
                return;
            }
            const numericValue = parseFloat(rawValue);
            if (!isNaN(numericValue)) {
                const formatted = numericValue
                    .toLocaleString("fr-CA", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                    })
                    .replace(/\u00A0/g, " ");
                setHourlyRate(formatted);
            } else {
                setHourlyRate(value);
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const sendFormulaire = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formVerified()) {
            setErrorMessage({
                error: true,
                message: "Erreur dans le formulaire: remplissez tous les champs",
            });
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
                setErrorMessage({ error: false, message: "" });
            }, 3000);
            return;
        }

        try {
            const numericPrice = parseFloat(
                hourlyRate.replace(/\s/g, "").replace(",", ".")
            );
            const dataToSend = { ...formData, hourlyRate: numericPrice };

            const reponse = await fetch("/api/hourlyRates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formData: dataToSend, userData: user }),
            });

            if (!reponse.ok) {
                throw new Error("Erreur serveur hourlyRates/create");
            }

            await reponse.json();

            // On success, redirect to item-catalogue
            router.push("/hourlyRates");
        } catch (err) {
            console.error("Erreur dans l'envoi des données [hourlyRates/create]", err);
            setErrorMessage({
                error: true,
                message: "Erreur lors de l'ajout du taux horaire",
            });
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
                setErrorMessage({ error: false, message: "" });
            }, 3000);
        }
    };

    const formVerified = (): boolean => {
        const p = parseFloat(hourlyRate.replace(/\s/g, "").replace(",", "."));
        return (
            formData.workPosition.trim() !== "" &&
            formData.clientName.trim() !== "" &&
            p >= 0
        );
    };

    return (
        <form
            onSubmit={sendFormulaire}
            className={[
                "w-full max-w-2xl mx-auto mt-6 space-y-6",
                "rounded-2xl border border-white/10 bg-white/5 backdrop-blur",
                "shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] px-6 sm:px-8 py-8 sm:py-10",
            ].join(" ")}
        >
            {showAlert && Errormessage.error && (
                <Alert
                    className={[
                        "w-full rounded-xl",
                        "border",
                        "bg-rose-500/10 border-rose-400/30",
                        "text-slate-100",
                    ].join(" ")}
                >
                    <div className="flex items-start gap-3">
                        <AiOutlineAlert className="h-5 w-5 text-rose-300" />
                        <div>
                            <AlertTitle className="text-slate-100 text-sm font-semibold">
                                Erreur
                            </AlertTitle>
                            <AlertDescription className="text-rose-300">
                                {Errormessage.message}
                            </AlertDescription>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Nom du client */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label
                    htmlFor="hourlyClientName"
                    className="text-slate-200 font-semibold sm:w-1/3"
                >
                    {t("hourlyRateClient")}
                </label>
                <input
                    className={[
                        "h-11 w-full sm:flex-1 rounded-xl px-3 py-2",
                        "text-slate-100 placeholder:text-slate-400",
                        "bg-white/5 border border-white/10",
                        "focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40",
                    ].join(" ")}
                    type="text"
                    id="clientName"
                    name="clientName"
                    placeholder={t("hourlyRateClient")}
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* Poste de travail */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label
                    htmlFor="workPosition"
                    className="text-slate-200 font-semibold sm:w-1/3"
                >
                    {t("hourlyRateWorkPosition")}
                </label>
                <input
                    className={[
                        "h-11 w-full sm:flex-1 rounded-xl px-3 py-2",
                        "text-slate-100 placeholder:text-slate-400",
                        "bg-white/5 border border-white/10",
                        "focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40",
                    ].join(" ")}
                    type="text"
                    id="workPosition"
                    name="workPosition"
                    placeholder={t("hourlyRateWorkPosition")}
                    value={formData.workPosition}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* Taux Horaire */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label htmlFor="tauxHoraire" className="text-slate-200 font-semibold sm:w-1/3">
                    {t("hourlyRateRate")}
                </label>
                <input
                    className={[
                        "h-11 w-full sm:flex-1 rounded-xl px-3 py-2",
                        "text-slate-100 placeholder:text-slate-400",
                        "bg-white/5 border border-white/10",
                        "focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40",
                    ].join(" ")}
                    type="text"
                    id="hourlyRate"
                    autoComplete="on"
                    name="hourlyRate"
                    placeholder={t("hourlyRateRate")}
                    value={hourlyRate}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center mt-2">
                <div className="sm:flex-1 flex justify-center">
                    <Button
                        type="submit"
                        className="w-full sm:w-2/3 h-12 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-colors border border-sky-400/40 shadow-sm"
                    >
                        {t("creationHourlyRate")}
                    </Button>
                </div>
            </div>
        </form>
    );
}
