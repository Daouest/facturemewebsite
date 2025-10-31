"use client";
import react, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AiOutlineAlert } from "react-icons/ai";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFormData } from "@/app/context/FormContext";
import { useUser } from "../context/UserContext";

export default function FormCreationItem() {
  const { formData, setFormData } = useFormData();
  const { user } = useUser();
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
        setFormData({
          ...formData,
          file: fileUrl,
          image: imageBase64,
        });
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
        message: "Erreur dans le formulaire: remplissez tous les champs",
      });
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setErrorMessage({ error: false, message: "" });
      }, 3000);
      return;
    }
    setShowAlert(true);

    try {
      const numereicPrice = parseFloat(
        price.replace(/\s/g, "").replace(",", ".")
      );
      const dataToSend = {
        ...formData,
        prix: numereicPrice,
      };

      const reponse = await fetch("/api/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: dataToSend,
          userData: user,
        }),
      });

      if (!reponse.ok) {
        throw new Error("Erreur serveur creation-item");
      }

      const data = await reponse.json();
      console.log("Réponse du serveur", data);
    } catch (err) {
      console.error("Erreur dans l'envoi des données [creation-item]", err);
    } finally {
      setTimeout(() => {
        setShowAlert(false);
        setFormData({
          ...formData,
          itemNom: "",
          description: "",
          prix: 0,
          image: "",
        });
        window.location.reload();
      }, 1500);
    }
  };

  const formVerified = (): boolean => {
    const p = parseFloat(price.replace(/\s/g, "").replace(",", "."));
    if (
      formData.itemNom.trim() !== "" &&
      formData.description.trim() !== "" &&
      p >= 0
    ) {
      return true;
    }
    return false;
  };

  return (
    <form
      onSubmit={sendFormulaire}
      className="
        w-full max-w-2xl mx-auto
        bg-white border border-gray-100
        rounded-2xl shadow-lg
        px-6 sm:px-8 py-8 sm:py-10
        mt-6
        space-y-6
      "
    >
      {showAlert && (
        <Alert
          className={`w-full ${
            Errormessage.error
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <AiOutlineAlert
            className={`h-4 w-4 shrink-0 ${
              Errormessage.error ? "text-red-600" : "text-green-600"
            }`}
          />
          <AlertTitle className="text-sm font-semibold">
            {Errormessage.error ? "Erreur" : "Succès"}
          </AlertTitle>
          {!Errormessage.error ? (
            <AlertDescription className="text-green-700">
              Formulaire envoyé avec succès.
            </AlertDescription>
          ) : (
            <AlertDescription className="text-red-700">
              {Errormessage.message}
            </AlertDescription>
          )}
        </Alert>
      )}

      {/* Nom item */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label
          htmlFor="itemNom"
          className="text-gray-800 font-semibold sm:w-1/3"
        >
          Nom item :
        </label>
        <input
          className="h-11 w-full sm:flex-1 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          type="text"
          id="itemNom"
          name="itemNom"
          placeholder="Votre item"
          value={formData.itemNom}
          onChange={handleChange}
          required
        />
      </div>

      {/* Description */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label
          htmlFor="description"
          className="text-gray-800 font-semibold sm:w-1/3"
        >
          Description :
        </label>
        <input
          className="h-11 w-full sm:flex-1 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          type="text"
          id="description"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      {/* Prix */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label htmlFor="prix" className="text-gray-800 font-semibold sm:w-1/3">
          Prix item :
        </label>
        <input
          className="h-11 w-full sm:flex-1 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          type="text"
          id="prix"
          autoComplete="on"
          name="prix"
          placeholder="Le prix"
          value={price}
          onChange={handleChange}
          required
        />
      </div>

      {/* Image */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label
          htmlFor="imageUpload"
          className="text-gray-800 font-semibold sm:w-1/3"
        >
          Ajouter une image :
        </label>
        <input
          className="h-11 w-full sm:flex-1 rounded-xl border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
            className="w-full sm:w-2/3 h-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow"
          >
            Créer item
          </Button>
        </div>
      </div>
    </form>
  );
}
