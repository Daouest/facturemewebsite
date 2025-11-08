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
import { createTranslator, formatIntoDecimal } from "@/app/lib/utils";
import { useFormData } from "@/app/context/FormContext";
import { useUser } from "@/app/context/UserContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";
import Link from "next/link";
import { AiOutlineEdit } from 'react-icons/ai';
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["item", idObjet],
    queryFn: async () => {
      const res = await fetch(`/api/item-catalogue?id=${idObjet}`);
      if (!res.ok) throw new Error("Erreur lors de la récupération");
      return res.json();
    },
    enabled: !!idObjet,
    select: (data) => data.find((item: any) => item.idObjet === idObjet),
  });

  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        _id: data._id,
        idObjet,
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
          .replace(/\u00A0/g, " ")
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

  useEffect(() => {
    if (isLoading) return;
    if (data === undefined || data === null) {
      router.push("/not-found");
    }
  }, [data]);
  async function updateItemRequest(dataToSend: nay) {
    const res = await fetch("/api/item", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: dataToSend, userData: user }),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour");
    return true;
  }

  const deleteItemRequest = async (id: any) => {
    const res = await fetch("/api/item", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formData: id ?? formData.idObjet,
        userData: user,
      }),
    });
    if (!res.ok) throw Error("Erreur lors de la suppréssion");
    return true;
  };

  const mutation = useMutation({
    mutationFn: updateItemRequest,
    onSuccess: (ok) => {
      queryClient.setQueryData(["items", idObjet], ok);
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error) => {
      console.error("Erreur de la modification :", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItemRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      router.push("/item/item-catalogue");
    },
    onError: (error) => {
      console.error("Erreur de suppression :", error);
    },
  });

  const updateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVerified()) {
      setErrorMessage({
        error: true,
        message: "Erreur dans le formulaire: aucun champs modifié",
      });
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setErrorMessage({ error: false, message: "" });
      }, 3000);
      return;
    }

    setShowAlert(true);

    let numericPrice: number | undefined;
    let dataToSend = formData;

    if (!fileChanged) {
      numericPrice = parseFloat(price.replace(/\s/g, "").replace(",", "."));
      dataToSend = { ...formData, prix: numericPrice };
    }

    mutation.mutate(dataToSend, {
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
          router.push("/item/item-catalogue");
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
    if (p !== lastPrice && p > 0) return true;
    if (p === lastPrice && fileChanged) return true;
    return false;
  };

  const handleClickImage = () => {
    setFileChanged(true);
    fileInputRef.current?.click();
  };

  // ---------- LOADING ----------
  if (isLoading) {
    return (
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />
        <Link
          href="/item/item-catalogue"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          aria-label="Retour"
          title="Retour"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
        </Link>
        <main className="flex-1 pt-[80px]">
          <div className="max-w-4xl mx-auto px-6 pb-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Détails
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
        <Footer />
      </div>
    );
  }

  // ---------- ERROR ----------
  if (isError) {
    return (
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
        <Header />
        <Link
          href="/item/item-catalogue"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          aria-label="Retour"
          title="Retour"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
        </Link>
        <main className="flex-1 pt-[80px]">
          <div className="max-w-4xl mx-auto px-6 pb-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Détails
              </h1>
              <div className="my-4 border-t border-white/10" />
              <p className="text-lg text-slate-300">
                Erreur dans le chargement de l&apos;item
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---------- NORMAL ----------
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-8">
      <Header />

      {/* Back arrow */}
      <Link
        href="/item/item-catalogue"
        className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-2 shadow hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
        aria-label="Retour"
        title="Retour"
      >
        <AiOutlineArrowLeft className="h-5 w-5 text-slate-100" />
      </Link>

      <main className="flex-1 pt-[80px]">
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center">
              Détails
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
                        Formulaire envoyé avec succès.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Right column (texts/price) */}
                <div className="flex flex-col gap-6 md:gap-8 justify-center">
                  <div className="flex flex-col w-full gap-2">
                    <label
                      htmlFor="Nom"
                      className="text-xs font-medium text-slate-300"
                    >
                      Nom de l&apos;item
                    </label>
                    <input
                      type="text"
                      id="Nom"
                      name="Nom"
                      value={formData?.itemNom}
                      readOnly
                      className="text-slate-100 placeholder:text-slate-400 bg-white/5 border border-white/10 rounded-xl py-2 px-3 w-full outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40"
                    />
                  </div>

                  <div className="flex flex-col w-full gap-2">
                    <label
                      htmlFor="description"
                      className="text-xs font-medium text-slate-300"
                    >
                      {t("description")}
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData?.description}
                      readOnly
                      className="text-slate-100 placeholder:text-slate-400 bg-white/5 border border-white/10 rounded-xl py-2 px-3 w-full outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40"
                    />
                  </div>

                  <div className="flex flex-col w-full gap-2">
                    <label
                      htmlFor="prix"
                      className="text-xs font-medium text-slate-300"
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
                        "CAD"
                      )}
                      value={price}
                      onChange={handleChange}
                      className="text-slate-100 bg-white/5 border-2 border-white/10 hover:border-sky-400/40 rounded-xl py-2 px-3 w-full outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-400/40"
                    />
                  </div>
                </div>

                {/* Left column (image) */}
                <div className="flex flex-col items-center justify-center w-full">
                  <p className="text-slate-200 font-semibold mb-3">
                    Modifier l&apos;image
                  </p>

                  <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur ring-1 ring-white/10 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.6)]">
                    <button
                      type="button"
                      onClick={handleClickImage}
                      className="absolute right-3 top-3 z-10 rounded-lg bg-sky-500/90 px-3 py-1 text-xs font-medium text-white hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/50"
                      aria-label="Changer l'image"
                    >
                      Changer
                    </button>

                    {formData?.image ? (
                      <div className="flex items-center justify-center w-full h-full p-4">
                        <Image
                          src={formData.image}
                          priority
                          alt="FactureMe"
                          width={600}
                          height={400}
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
                      <div className="flex items-center justify-center w-full h-full p-4">
                        <Image
                          src={formData.file}
                          priority
                          alt="FactureMe"
                          width={600}
                          height={400}
                          className="object-contain max-w-full h-auto"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full p-8">
                        <Image
                          src="/default_image.jpg"
                          priority
                          alt="FactureMe"
                          width={600}
                          height={400}
                          className="object-contain max-w-full h-auto opacity-90"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 gap-10 mb-2 flex flex-col sm:flex-row cursor cursor-pointer justify-center items-center w-full">
                <div
                onClick={updateItem}
                >
                  <AiOutlineEdit
                    
                    color="black"
                    size={27}
                  />
                </div>

                <button
                  type="button"
                  title="Supprimer l'item"
                  onClick={() => deleteMutation.mutate(idObjet)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                >
                  <AiOutlineDelete className="h-5 w-5" />
                  Supprimer
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
