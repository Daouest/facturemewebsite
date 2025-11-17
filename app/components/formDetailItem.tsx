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
import { useFormData } from "@/app/context/FormContext";
import { useUser } from "@/app/context/UserContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
export default function FormDetailItem({ idObjet }: { idObjet: number }) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const { formData, setFormData } = useFormData();
  const [price, setPrice] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const router = useRouter();
  const [lastPrice, setLastPrice] = useState(0);
  const [fileChanged, setFileChanged] = useState(false);
  const [Errormessage, setErrorMessage] = useState({
    error: false,
    message: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const { user } = useUser();

  const { data, isLoading, isError, isFetching, isSuccess } = useQuery({
    queryKey: ["item", idObjet],
    queryFn: async () => {
      const res = await fetch(`/api/item-catalogue?id=${idObjet}`);
      if (!res.ok) throw new Error("Erreur lors de la récupération");
      const items = await res.json();
      return items;
    },
    enabled: !!idObjet && idObjet > 0,
    select: (data) => {
      const found = data.find((item: any) => {
        return Number(item.idObjet) === Number(idObjet);
      });
      return found;
    },
  });

  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        _id: data._id,
        idObjet: idObjet,
        itemNom: data?.productName ?? "",
        prix: data?.price ?? 0,
        description: data?.description ?? "",
        image: data?.productPhoto ?? "",
        file: "",
      }));
      setLastPrice(data.price ?? 0);
      setPrice(
        (data.price ?? 0)
          .toLocaleString("fr-CA", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
          .replace(/\u00A0/g, " "),
      );
    }
  }, [data, idObjet, setFormData]);

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

    // Only allow price changes - name and description are read-only
    if (name === "itemNom" || name === "description") {
      return;
    }

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

  useEffect(() => {
    // Don't do anything while loading or fetching
    if (isLoading || isFetching) {
      return;
    }

    // Only redirect if query completed successfully but no item was found
    if (isSuccess && !isError && (data === undefined || data === null)) {
      // Check if idObjet is valid before redirecting
      if (idObjet && idObjet > 0) {
        const timer = setTimeout(() => {
          router.push("/not-found");
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [data, isLoading, isFetching, isSuccess, isError, router, idObjet]);
  async function updateItemRequest(dataToSend: any) {
    const res = await fetch("/api/item", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formData: dataToSend,
        userData: user,
      }),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour");
    return true;
  }
  const updateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVerified()) {
      setErrorMessage({
        error: true,
        message: t("noFieldsModified"),
      });
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setErrorMessage({
          error: false,
          message: "",
        });
      }, 3000);

      return;
    }

    setShowAlert(true);

    let numereicPrice;
    let dataToSend = formData;
    if (!fileChanged) {
      numereicPrice = parseFloat(
        price
          .replace(/\s/g, "") // retire les espaces
          .replace(",", "."),
      );
      dataToSend = {
        ...formData,
        prix: numereicPrice,
      };
    }
    mutation.mutate(dataToSend, {
      //on lance la mutation
      onSuccess: () => {
        setTimeout(() => {
          setShowAlert(false);
          setFormData({
            itemNom: "",
            prix: 0,
            description: "",
            image: "",
            file: "",
          });
          setLastPrice(0);
          window.location.href = "/item/item-catalogue";
        }, 1500);
      },
    });
  };
  const deleteItemRequest = async (idObjet: any) => {
    const res = await fetch("/api/item", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formData: idObjet ?? formData.idObjet,
        userData: user,
      }),
    });
    if (!res.ok) {
      throw Error("Erreur lors de la suppréssion");
    }
    return true;
  };
  const mutation = useMutation({
    mutationFn: updateItemRequest,
    onSuccess: (updateItem) => {
      queryClient.setQueryData(["items", idObjet], updateItem); // met à jour le cache du détail
      queryClient.invalidateQueries({ queryKey: ["items"] }); // invalide la liste d'items pour un refresh
    },
    onError: (error) => {
      console.error("Erreur de la modification :", error);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteItemRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      window.location.href = "/item/item-catalogue";
    },
    onError: (error) => {
      console.error("Erreur de suppression :", error);
    },
  });

  const formVerified = (): boolean => {
    const p = parseFloat(price.replace(/\s/g, "").replace(",", "."));
    if (p !== lastPrice && p > 0 && fileChanged) return true;
    if (p !== lastPrice && p > 0 && !fileChanged) return true;
    if (p === lastPrice && fileChanged) return true;
    return false;
  };

  const handleClickImage = () => {
    setFileChanged(true);
    fileInputRef.current?.click();
  };

  // ---------- LOADING ----------
  if (isLoading || isFetching) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          {t("details")}
        </h1>
        <div className="my-4 border-t border-white/10" />
        <Image
          src="/Loading_Paperplane.gif"
          alt={t("loadingText")}
          width={200}
          height={200}
          className="object-contain max-w-full h-auto opacity-90 mx-auto"
        />
      </div>
    );
  }

  // ---------- ERROR ----------
  if (isError) {
    return (
      <>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            {t("details")}
          </h1>
          <div className="my-4 border-t border-white/10" />
          <p className="text-lg text-slate-300">{t("errorLoadingItem")}</p>
        </div>
      </>
    );
  }

  // ---------- NORMAL ----------
  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 text-center">
          {t("details")}
        </h1>
        <div className="my-3 border-t border-white/10" />

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
                <AlertTitle className="text-slate-100">
                  {t("message")}
                </AlertTitle>
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
        <form onSubmit={updateItem} id="bigContainer" className="mt-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Right column (texts/price) */}
            <div className="flex flex-col gap-2 md:gap-3 justify-center">
              <div className="flex flex-col w-full gap-1.5">
                <label
                  htmlFor="Nom"
                  className="text-sm font-medium text-slate-300"
                >
                  {t("itemName")}
                </label>
                <input
                  type="text"
                  id="Nom"
                  name="itemNom"
                  value={formData?.itemNom}
                  readOnly
                  disabled
                  className="text-slate-100 text-base placeholder:text-slate-400 bg-slate-800/50 border-2 border-white/10 rounded-lg py-2 px-3 w-full outline-none cursor-not-allowed opacity-60"
                />
              </div>

              <div className="flex flex-col w-full gap-1.5">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-300"
                >
                  {t("description")}
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData?.description}
                  readOnly
                  disabled
                  className="text-slate-100 text-base placeholder:text-slate-400 bg-slate-800/50 border-2 border-white/10 rounded-lg py-2 px-3 w-full outline-none cursor-not-allowed opacity-60"
                />
              </div>

              <div className="flex flex-col w-full gap-1.5">
                <label
                  htmlFor="prix"
                  className="text-sm font-medium text-slate-300"
                >
                  {t("price")} $
                </label>
                <input
                  type="text"
                  id="prix"
                  autoComplete="on"
                  name="prix"
                  placeholder={formatIntoDecimal(
                    formData?.prix,
                    "fr-CA",
                    "CAD",
                  )}
                  value={price}
                  onChange={handleChange}
                  className="text-slate-100 text-base bg-white/5 border-2 border-white/10 hover:border-sky-400/40 rounded-lg py-2 px-3 w-full outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40"
                />
              </div>
            </div>

            {/* Left column (image) */}
            <div className="flex flex-col items-center justify-center w-full">
              <p className="text-slate-200 font-semibold mb-2 text-sm">
                {t("modifyImage")}
              </p>

              <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur ring-1 ring-white/10 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.6)]">
                <button
                  type="button"
                  onClick={handleClickImage}
                  className="absolute right-2 top-2 z-10 rounded-lg bg-sky-500/90 px-2 py-1 text-xs font-medium text-white hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/50"
                  aria-label={t("change")}
                >
                  {t("change")}
                </button>

                {formData?.image ? (
                  <div className="flex items-center justify-center w-full h-full p-2">
                    <Image
                      src={formData.image}
                      priority
                      alt="FactureMe"
                      width={400}
                      height={300}
                      className="object-contain max-w-full h-auto"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : formData?.file ? (
                  <div className="flex items-center justify-center w-full h-full p-2">
                    <Image
                      src={formData.file}
                      priority
                      alt="FactureMe"
                      width={400}
                      height={300}
                      className="object-contain max-w-full h-auto"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full p-4">
                    <Image
                      src="/default_image.jpg"
                      priority
                      alt="FactureMe"
                      width={400}
                      height={300}
                      className="object-contain max-w-full h-auto opacity-90"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-4 mb-4 flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
            <Button
              type="submit"
              variant="outline"
              className="rounded-xl bg-sky-500 text-white hover:bg-sky-400 border border-sky-400/40 shadow-sm"
            >
              {t("modify")}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="rounded-xl bg-white/5 text-slate-100 hover:bg-white/10 border border-white/10"
              onClick={() => router.push("/item/item-catalogue")}
            >
              {t("return")}
            </Button>

            <button
              type="button"
              title={t("deleteItem")}
              onClick={() => deleteMutation.mutate(idObjet)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
            >
              <AiOutlineDelete className="h-5 w-5" />
              {t("deleteItem")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
