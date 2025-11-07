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
        message: "Erreur dans le formulaire: aucun champs modifié",
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
          .replace(",", ".")
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
      router.push("/item/item-catalogue");
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

  // Loading state with consistent shell
  if (isLoading) {
    return (
      <div className="min-h-dvh flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
        <Header />
        <Link
          href="/item/item-catalogue"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Retour"
          title="Retour"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
        </Link>
        <main className="flex-1 pt-[80px]">
          <div className="max-w-4xl mx-auto px-6 pb-10">
            <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
                Détails
              </h1>
              <div className="my-4 border-t border-gray-200 w-full" />
              <Image
                src="/Loading_Paperplane.gif"
                alt="Chargement..."
                width={200}
                height={200}
                className="object-contain max-w-full h-auto"
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state with consistent shell
  if (isError) {
    return (
      <div className="min-h-dvh flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
        <Header />
        <Link
          href="/item/item-catalogue"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Retour"
          title="Retour"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
        </Link>
        <main className="flex-1 pt-[80px]">
          <div className="max-w-4xl mx-auto px-6 pb-10">
            <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Détails
              </h1>
              <div className="my-4 border-t border-gray-200" />
              <p className="text-lg text-gray-700">
                Erreur dans le chargement de l'items
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Normal render
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
      <Header />

      {/* Back arrow */}
      <Link
        href="/item/item-catalogue"
        className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Retour"
        title="Retour"
      >
        <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
      </Link>

      <main className="flex-1 pt-[80px]">
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
            {/* Title + divider */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
              Détails
            </h1>
            <div className="my-4 border-t border-gray-200" />

            {/* Alert */}
            {showAlert && (
              <Alert className="bg-gray-700 mt-2 w-full sm:w-[80%] md:w-[70%] mx-auto flex flex-col items-center text-white p-4 rounded-lg">
                <AiOutlineAlert className="h-5 w-5 mb-1" />
                <AlertTitle className="text-center text-white w-full">
                  Message
                </AlertTitle>
                {!Errormessage.error ? (
                  <AlertDescription className="text-center text-green-300">
                    Formulaire envoyé avec succès.
                  </AlertDescription>
                ) : (
                  <AlertDescription className="text-center text-red-400">
                    {Errormessage.message}
                  </AlertDescription>
                )}
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
                <div className="flex flex-col gap-6 md:gap-8 justify-center items-center">
                  <div className="flex flex-col items-center w-full gap-2">
                    <label
                      htmlFor="Nom"
                      className="text-sm sm:text-base font-medium"
                    >
                      Nom de l'item
                    </label>
                    <input
                      type="text"
                      id="Nom"
                      name="Nom"
                      value={formData?.itemNom}
                      readOnly
                      className="text-center border border-gray-300 rounded-2xl py-2 w-[90%] sm:w-[70%]"
                    />
                  </div>

                  <div className="flex flex-col items-center w-full gap-2">
                    <label
                      htmlFor="description"
                      className="text-sm sm:text-base font-medium"
                    >
                      {t("description")}
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData?.description}
                      readOnly
                      className="text-center border border-gray-300 rounded-2xl py-2 w-[90%] sm:w-[70%]"
                    />
                  </div>

                  <div className="flex flex-col items-center w-full gap-2">
                    <label
                      htmlFor="prix"
                      className="text-sm sm:text-base font-medium"
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
                      className="text-center border-2 hover:border-blue-600 border-gray-300 rounded-2xl py-2 w-[90%] sm:w-[70%]"
                    />
                  </div>
                </div>

                {/* Left column (image) */}
                <div className="flex flex-col items-center justify-center w-full relative">
                  <p className="text-black font-semibold mb-2">
                    Modifier l'image
                  </p>

                  {formData?.image ? (
                    <div
                      className="flex items-center justify-center w-full h-full p-4 cursor-pointer transform transition-transform duration-300 hover:scale-110"
                      onClick={handleClickImage}
                    >
                      <Image
                        src={formData.image}
                        priority={true}
                        alt="FactureMe"
                        width={300}
                        height={300}
                        className="object-contain max-w-full h-auto rounded-lg"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  ) : formData.file ? (
                    <div className="flex items-center justify-center w-full h-full p-4">
                      <Image
                        src={formData.file}
                        priority={true}
                        alt="FactureMe"
                        width={300}
                        height={300}
                        className="object-contain max-w-full h-auto rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full p-4">
                      <Image
                        src="/default_image.jpg"
                        priority={true}
                        alt="FactureMe"
                        width={300}
                        height={300}
                        className="object-contain max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
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

                <div
                  title="Supprimer l'item"
                  className="flex flex-row justify-end items-end cursor-pointer"
                  onClick={() => {
                    deleteMutation.mutate(idObjet);
                  }}
                >
                  <AiOutlineDelete size={25} color="red" />
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
