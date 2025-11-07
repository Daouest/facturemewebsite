"use client";

import { useState, useEffect, startTransition } from "react";
import { ClientForm, Address } from "@/app/lib/definitions";
import { createClient } from "@/app/lib/actions/clients-actions";
import Link from "next/link";

export default function Form() {
  const [isPending, setisPending] = useState(false);
  const [address, setAddress] = useState<Address>({
    idAddress: -1,
    address: "",
    province: "",
    zipCode: "",
    country: "CA",
    city: "",
  });
  const [formData, setFormData] = useState<ClientForm>({
    idUser: -1,
    idClient: -1,
    clientName: "",
    clientAddress: address,
  });
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({
    text: "",
    type: "",
  });

  useEffect(() => {
    //update client address (formData) when address is updated.
    setFormData((prev) => ({
      ...prev,
      clientAddress: address,
    }));
  }, [address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setMessage({
        text: "Veuillez remplir tous les champs requis.",
        type: "error",
      });
      return;
    }

    setisPending(true);
    setMessage({ text: "", type: "" }); // Clear any previous message

    // Simulate a delay
    setTimeout(() => {
      setisPending(false);
      setMessage({ text: "✅ Client ajouté avec succès !", type: "success" });

      // action
      createClient(formData);

      // maybe reset form or navigate away
    }, 1000);
  };

  const isFormValid = () => {
    const { clientName, clientAddress } = formData;
    const { address, city, province, zipCode, country } = clientAddress;

    return (
      clientName.trim() !== "" &&
      address.trim() !== "" &&
      city.trim() !== "" &&
      province.trim() !== "" &&
      zipCode.trim() !== "" &&
      country.trim() !== ""
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        id="bigContainer"
        className="flex flex-col items-center w-full max-w-5xl rounded-xl mt-20 mb-8"
      >
        {/* Messages/alerte */}
        {message.text && (
          <div
            className={`w-full text-center p-4 mb-4 rounded-xl ${
              message.type === "success"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-red-500/20 text-red-300 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {/*  Form  */}
        <div id="form" className="flex flex-col gap-4 w-full p-6">
          {/*Nom*/}
          <div
            id="clientNameContainer"
            className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"
          >
            <p className="mb-3 block font-semibold text-slate-100 flex items-center gap-2">
              Nom du client
            </p>
            <div className="flex flex-row items-center">
              <label className="text-sm font-semibold text-slate-300 items-center mr-3">
                Nom
              </label>
              <input
                required
                placeholder="ex.: John Pork"
                pattern="^[^\d]+$"
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                className="w-full bg-white/10 backdrop-blur rounded-xl border border-white/20 py-3 pl-5 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
              />
            </div>
          </div>

          {/*Addresse*/}
          <div
            id="clientAddressContainer"
            className="flex flex-col gap-1 bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"
          >
            <p className="mb-3 block font-semibold text-slate-100 flex items-center gap-2">
              Addresse du client
            </p>

            {/*Premier ligne: addresse, ville*/}
            <div className="flex flex-row w-full gap-4">
              <div className="flex flex-row items-center w-full">
                <label className="text-sm font-semibold text-slate-300 items-center mr-3">
                  Addresse
                </label>
                <input
                  required
                  placeholder="ex.: 123, rue des Alphabets"
                  onChange={(e) =>
                    setAddress({ ...address, address: e.target.value })
                  }
                  className="w-full bg-white/10 backdrop-blur rounded-xl border border-white/20 py-3 pl-5 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
              <div className="flex flex-row items-center w-full">
                <label className="text-sm font-semibold text-slate-300 items-center mr-3">
                  Ville
                </label>
                <input
                  required
                  pattern="^[^\d]+$"
                  placeholder="ex.: Montréal"
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="w-full bg-white/10 backdrop-blur rounded-xl border border-white/20 py-3 pl-5 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
            </div>

            {/*Seconde ligne: code postal, province*/}
            <div className="flex flex-row w-full gap-4">
              <div className="flex flex-row items-center w-full">
                <label className="text-sm font-semibold text-slate-300 items-center mr-3">
                  Code postal
                </label>
                <input
                  required
                  placeholder="ex.: A1B 2C3"
                  value={address.zipCode}
                  minLength={6}
                  maxLength={6}
                  pattern="^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$"
                  onChange={(e) =>
                    setAddress({ ...address, zipCode: e.target.value })
                  }
                  className="w-full bg-white/10 backdrop-blur rounded-xl border border-white/20 py-3 pl-5 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
              <div className="flex flex-row items-center w-full">
                <label className="text-sm font-semibold text-slate-300 items-center mr-3">
                  Province
                </label>
                <Provinces
                  value={address.province}
                  onChange={(province) => setAddress({ ...address, province })}
                />
              </div>
            </div>
          </div>

          {/*Boutons de soumission*/}
          <div id="buttons" className="flex justify-end gap-4">
            <Link
              href="/clients-catalogue"
              className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur text-slate-200 font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
              Annuler
            </Link>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl border border-sky-400/40 bg-sky-500/20 text-sky-200 font-medium hover:bg-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-sky-200 border-t-transparent rounded-full"></span>
                  Ajout...
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  Ajouter le client
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

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
      className="w-full bg-white/10 backdrop-blur rounded-xl border border-white/20 py-3 pl-5 text-sm text-slate-100 outline-none appearance-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
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

type ProvincesProps = {
  value: string;
  onChange: (province: string) => void;
};
