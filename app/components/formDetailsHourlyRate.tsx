"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  AiOutlineAlert,
  AiOutlineDelete,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator, formatIntoDecimal } from "@/app/_lib/utils/format";
import { useFormData } from "@/app/context/HourlyRateFormContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { set } from "mongoose";

export default function FormDetailsHourlyRate({
  idObjet,
}: {
  idObjet: number;
}) {
  //traduction
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  //router et alertes
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  // const [fileChanged, setFileChanged] = useState(false);
  const [Errormessage, setErrorMessage] = useState({
    error: false,
    message: "",
  });

  //form
  const queryClient = useQueryClient();
  const { formData, setFormData } = useFormData();
  const [rate, setRate] = useState<string>("");

  //Query --> va chercher l'objet selon son id
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hourlyRate", idObjet],
    queryFn: async () => {
      const res = await fetch(`/api/hourlyRates`); //recherche toutes les donnees
      if (!res.ok) throw new Error("Erreur lors de la récupération");
      return res.json();
    },
    enabled: !!idObjet,
    select: (data) =>
      data.find((hourlyRate: any) => hourlyRate.idObjet === idObjet), //retourne l'objet dont le idObjet equivaut
  });

  //On met les infos dans le form
  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        idObjet,
        clientName: data?.clientName ?? "",
        hourlyRate: data?.hourlyRate ?? 0,
        workPosition: data?.workPosition ?? "",
      }));
      setRate(
        (data.hourlyRate ?? 0)
          .toLocaleString("fr-CA", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
          .replace(/\u00A0/g, " "),
      );
    }
  }, [data, idObjet, setFormData]);

  //On s'occupe des modifications du form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "hourlyRate") {
      const rawValue = value.replace(/\s/g, "").replace(",", ".");
      if (rawValue === "." || /^\d+\.$/.test(rawValue)) {
        setRate(rawValue.replace(".", ","));
        return;
      }
      const numericValue = parseFloat(rawValue);
      if (!isNaN(numericValue)) {
        setFormData({ ...formData, [name]: numericValue });
        const formatted = numericValue
          .toLocaleString("fr-CA", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
          .replace(/\u00A0/g, " ");
        setRate(formatted);
      } else {
        setRate(value);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  //Loading handling
  useEffect(() => {
    if (isLoading) return;
    if (data === undefined || data === null) {
      router.push("/not-found");
    }
  }, [data, isLoading, router]);

  //Requete vers l'API (PUT)
  async function updateRequest(dataToSend: unknown) {
    const res = await fetch("/api/hourlyRates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: dataToSend }),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour");
    return true;
  }

  //Requete vers l'API (DELETE)
  const deleteRequest = async (id: any) => {
    const res = await fetch("/api/hourlyRates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formData: idObjet ?? formData.idObjet,
      }),
    });
    if (!res.ok) throw Error("Erreur lors de la suppression");
    return true;
  };

  const mutation = useMutation({
    mutationFn: updateRequest,
    onSuccess: (ok) => {
      queryClient.setQueryData(["hourlyRates", idObjet], ok);
      queryClient.invalidateQueries({ queryKey: ["hourlyRates"] });
    },
    onError: (error) => {
      console.error("Erreur de la modification :", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hourlyRates"] });
      router.push("/hourlyRates");
    },
    onError: (error) => {
      console.error("Erreur de suppression :", error);
    },
  });

  const updateItem = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAlert(true);

    let dataToSend = formData;

    // if (!fileChanged) {
    //   numericPrice = parseFloat(rate.replace(/\s/g, "").replace(",", "."));
    //   dataToSend = { ...formData, hourlyRate: numericPrice };
    // }

    mutation.mutate(dataToSend, {
      onSuccess: () => {
        setTimeout(() => {
          setShowAlert(false);
          //Remettre les champs a zero
          setFormData({
            clientName: "",
            workPosition: "",
            hourlyRate: 0,
            idUser: -1,
            idParent: -1,
            enforcementDate: new Date(),
          });
          setRate("0");
          router.push("/hourlyRates");
        }, 1500);
      },
    });
  };

  // const formVerified = (): boolean => {
  //   const p = parseFloat(rate.replace(/\s/g, "").replace(",", "."));
  //   if (p !== lastRate && p > 0) return true;
  //   return false;
  // };

  // ---------- LOADING ----------
  if (isLoading) {
    return (
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Link
          href="/hourlyRates"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          aria-label={t("hourlyRateReturn")}
          title={t("hourlyRateReturn")}
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
        </Link>
        <main className="flex-1 pt-[80px]">
          <div className="max-w-4xl mx-auto px-6 pb-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                {t("hourlyRateDetails")}
              </h1>
              <div className="my-4 border-t border-white/10" />
              <Image
                src="/Loading_Paperplane.gif"
                alt="Chargement..."
                width={200}
                height={200}
                className="object-contain max-w-full h-auto opacity-90 mx-auto"
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------- ERROR ----------
  if (isError) {
    return (
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Link
          href="/hourlyRates"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          aria-label={t("hourlyRateReturn")}
          title={t("hourlyRateReturn")}
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
        </Link>
        <main className="flex-1 pt-[80px]">
          <div className="max-w-4xl mx-auto px-6 pb-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                {t("hourlyRateDetails")}
              </h1>
              <div className="my-4 border-t border-white/10" />
              <p className="text-lg text-slate-300">{t("hourlyRateError")}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------- FORM ----------
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
      {/* Back arrow */}
      <Link
        href="/hourlyRates"
        className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
        aria-label={t("hourlyRateReturn")}
        title={t("hourlyRateReturn")}
      >
        <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
      </Link>

      <main className="flex-1 pt-[80px]">
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center">
              {t("hourlyRateDetails")}
            </h1>
            <div className="my-4 border-t border-white/10" />

            {/* Alert */}
            {showAlert && (
              <Alert className="bg-white/5 border border-white/10 text-slate-100 mt-2 w-full sm:w-[80%] md:w-[70%] mx-auto rounded-xl">
                <div className="flex items-start gap-3 p-4">
                  <AiOutlineAlert
                    className={`h-5 w-5 ${
                      Errormessage.error ? "text-rose-300" : "text-emerald-300"
                    }`}
                  />
                  <div className="flex-1">
                    <AlertTitle className="text-slate-100">Message</AlertTitle>
                    {!Errormessage.error ? (
                      <AlertDescription className="text-emerald-300">
                        {t("formSentWithSucces")}
                      </AlertDescription>
                    ) : (
                      <AlertDescription className="text-rose-300">
                        {Errormessage.message}
                      </AlertDescription>
                    )}
                  </div>
                </div>
              </Alert>
            )}

            {/* Form card */}
            <form
              onSubmit={updateItem}
              id="bigContainer"
              className="mt-6 w-full"
            >
              <div className="w-full">
                {/* Right column (texts/price) */}
                <div className="flex flex-col gap-6 md:gap-8 justify-center">
                  <div className="flex flex-col w-full gap-2">
                    <label
                      htmlFor="clientName"
                      className="text-xs font-medium text-slate-300"
                    >
                      {t("hourlyRateClient")}
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      name="clientName"
                      value={formData?.clientName}
                      onChange={handleChange}
                      className="text-slate-100 placeholder:text-slate-400 bg-white/5 border border-white/10 rounded-xl py-2 px-3 w-full outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40"
                    />
                  </div>

                  <div className="flex flex-col w-full gap-2">
                    <label
                      htmlFor="workPosition"
                      className="text-xs font-medium text-slate-300"
                    >
                      {t("hourlyRateWorkPosition")}
                    </label>
                    <input
                      type="text"
                      id="workPosition"
                      name="workPosition"
                      value={formData?.workPosition}
                      onChange={handleChange}
                      className="text-slate-100 placeholder:text-slate-400 bg-white/5 border border-white/10 rounded-xl py-2 px-3 w-full outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40"
                    />
                  </div>

                  <div className="flex flex-col w-full gap-2">
                    <label
                      htmlFor="hourlyRate"
                      className="text-xs font-medium text-slate-300"
                    >
                      {t("hourlyRateRate")}
                    </label>
                    <input
                      type="text"
                      id="hourlyRate"
                      autoComplete="on"
                      name="hourlyRate"
                      placeholder={formatIntoDecimal(
                        formData?.hourlyRate,
                        "fr-CA",
                        "CAD",
                      )}
                      value={rate}
                      onChange={handleChange}
                      className="text-slate-100 bg-white/5 border-2 border-white/10 hover:border-sky-400/40 rounded-xl py-2 px-3 w-full outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 mb-2 flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                <Button
                  type="submit"
                  variant="outline"
                  className="rounded-xl bg-sky-500 text-white hover:bg-sky-400 border border-sky-400/40 shadow-sm"
                >
                  {t("update")}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl bg-white/5 text-slate-100 hover:bg-white/10 border border-white/10"
                  onClick={() => router.push("/hourlyRates")}
                >
                  {t("hourlyRateReturn")}
                </Button>

                <button
                  type="button"
                  title="Supprimer l'item"
                  onClick={() => deleteMutation.mutate(idObjet)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                >
                  <AiOutlineDelete className="h-5 w-5" />
                  {t("delete")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
