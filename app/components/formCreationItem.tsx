"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AiOutlineAlert } from "react-icons/ai";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFormData } from "@/app/context/FormContext";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "@/app/context/langageContext";

export default function FormCreationItem() {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  const { formData, setFormData } = useFormData();
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [price, setPrice] = useState<string>("");

  const [Errormessage, setErrorMessage] = useState({
    error: false,
    message: "",
  });
  const [showAlert, setShowAlert] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && formData !== null) {
      const fileUrl = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = () => {
        const imageBase64 = reader.result as string;
        setFormData({ ...formData, file: fileUrl, image: imageBase64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "prix") {
      const rawValue = value.replace(/\s/g, "").replace(",", ".");
      if (rawValue === "." || /^\d+\.$/.test(rawValue)) {
        setPrice(rawValue.replace(".", ","));
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
        setPrice(formatted);
      } else {
        setPrice(value);
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
        message: t("fillAllFields"),
      });
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setErrorMessage({ error: false, message: "" });
      }, 3000);
      return;
    }

    try {
      const numereicPrice = parseFloat(
        price.replace(/\s/g, "").replace(",", ".")
      );
      const dataToSend = { ...formData, prix: numereicPrice };

      const reponse = await fetch("/api/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: dataToSend, userData: user }),
      });

      if (!reponse.ok) {
        throw new Error("Erreur serveur creation-item");
      }

      await reponse.json();

      // Reset form data to initial state
      setFormData({
        itemNom: "",
        description: "",
        prix: 0,
        image: "",
        file: "",
      });
      setPrice("");

      // Invalidate the items cache to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["items"] });

      // On success, redirect to item-catalogue
      router.push("/item/item-catalogue");
    } catch (err) {
      console.error("Erreur dans l'envoi des données [creation-item]", err);
      setErrorMessage({
        error: true,
        message: t("creationError"),
      });
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setErrorMessage({ error: false, message: "" });
      }, 3000);
    }
  };

  const formVerified = (): boolean => {
    const p = parseFloat(price.replace(/\s/g, "").replace(",", "."));
    return (
      formData.itemNom.trim() !== "" &&
      formData.description.trim() !== "" &&
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
                {t("error")}
              </AlertTitle>
              <AlertDescription className="text-rose-300">
                {Errormessage.message}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Nom item */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label
          htmlFor="itemNom"
          className="text-slate-200 font-semibold sm:w-1/3"
        >
          {t("productName")}
        </label>
        <input
          className={[
            "h-11 w-full sm:flex-1 rounded-xl px-3 py-2",
            "text-slate-100 placeholder:text-slate-400",
            "bg-white/5 border border-white/10",
            "focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40",
          ].join(" ")}
          type="text"
          id="itemNom"
          name="itemNom"
          placeholder={t("productName")}
          value={formData.itemNom}
          onChange={handleChange}
          required
        />
      </div>

      {/* Description */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label
          htmlFor="description"
          className="text-slate-200 font-semibold sm:w-1/3"
        >
          {t("description")}
        </label>
        <input
          className={[
            "h-11 w-full sm:flex-1 rounded-xl px-3 py-2",
            "text-slate-100 placeholder:text-slate-400",
            "bg-white/5 border border-white/10",
            "focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40",
          ].join(" ")}
          type="text"
          id="description"
          name="description"
          placeholder={t("description")}
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      {/* Prix */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label htmlFor="prix" className="text-slate-200 font-semibold sm:w-1/3">
          {t("price")}
        </label>
        <input
          className={[
            "h-11 w-full sm:flex-1 rounded-xl px-3 py-2",
            "text-slate-100 placeholder:text-slate-400",
            "bg-white/5 border border-white/10",
            "focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40",
          ].join(" ")}
          type="text"
          id="prix"
          autoComplete="on"
          name="prix"
          placeholder={t("price")}
          value={price}
          onChange={handleChange}
          required
        />
      </div>

      {/* Image */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label
          htmlFor="imageUpload"
          className="text-slate-200 font-semibold sm:w-1/3"
        >
          {t("image")}
        </label>
        <input
          className={[
            "h-11 w-full sm:flex-1 rounded-xl px-3 py-2",
            "text-slate-100 file:text-slate-100 placeholder:text-slate-400",
            "bg-white/5 border border-white/10",
            "focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40",
            "file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0",
            "file:bg-sky-500/10 file:text-sky-200 hover:file:bg-sky-500/20",
          ].join(" ")}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          id="imageUpload"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center mt-2">
        <div className="sm:flex-1 flex justify-center">
          <Button
            type="submit"
            className="w-full sm:w-2/3 h-12 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-colors border border-sky-400/40 shadow-sm"
          >
            {t("createProduct")}
          </Button>
        </div>
      </div>
    </form>
  );
}
