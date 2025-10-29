"use client";

import {
  CustomerField,
  ItemField,
  BusinessField,
  InvoiceForm,
} from "@/app/lib/definitions";
import { createItemKey } from "@/app/lib/utils";
import { AiOutlineArrowLeft } from "react-icons/ai";
import Link from "next/link";
import {
  createInvoice,
  InvoiceCreationFormState,
} from "@/app/lib/actions/invoice-creation-actions";
import { startTransition, useActionState } from "react";
import { useState, useEffect } from "react";
import CustomerSelect from "@/app/ui/invoices/CustomerSelect";
import BusinessSelect from "@/app/ui/invoices/BusinessSelect";
import ItemsList from "@/app/ui/invoices/ItemsList";
import Header from "@/app/components/Header";
import Footer from "@/app/components/footer";

export default function Form({
  customers,
  businesses,
  objects,
}: {
  customers: CustomerField[];
  businesses: BusinessField[];
  objects: ItemField[];
}) {
  const [form, setForm] = useState<InvoiceForm>({
    customerId: "",
    businessId: "",
    numberType: "auto",
    number: "",
    items: [],
  });

  const initialState: InvoiceCreationFormState = {
    message: null,
    errors: {},
    formData: form,
  };
  const [state, formAction, isPending] = useActionState(
    createInvoice,
    initialState
  );

  const updateField = (field: keyof InvoiceForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateItems = (newItems: InvoiceForm["items"]) => {
    setForm((prev) => ({ ...prev, items: newItems }));
  };

  // Only sync back on validation errors
  useEffect(() => {
    if (
      state.errors &&
      state.formData &&
      Object.keys(state.errors).length > 0
    ) {
      setForm(state.formData);
    }
  }, [state.errors, state.formData]);

  const productObjects = objects.filter((obj) => obj.type === "product");
  const hourlyObjects = objects.filter((obj) => obj.type === "hourly");

  const [selectedProduct, setSelectedProduct] = useState<number>(-1);
  const [selectedRate, setSelectedRate] = useState<number>(-1);

  const handleAddItem = () => {
    const itemKey = createItemKey(selectedProduct, "product");
    if (
      selectedProduct !== -1 &&
      !form.items.some((item) => createItemKey(item.id, item.type) === itemKey)
    ) {
      updateItems([
        ...form.items,
        { id: selectedProduct, type: "product", quantity: 1 },
      ]);
      setSelectedProduct(-1);
    }
  };

  const handleAddRate = () => {
    const itemKey = createItemKey(selectedRate, "hourly");
    if (
      selectedRate !== -1 &&
      !form.items.some((item) => createItemKey(item.id, item.type) === itemKey)
    ) {
      updateItems([
        ...form.items,
        {
          id: selectedRate,
          type: "hourly",
          breakTime: 0,
          startTime: "",
          endTime: "",
        },
      ]);
      setSelectedRate(-1);
    }
  };

  // Type-safe handlers for different item types
  const handleProductQuantityChange = (index: number, quantity: number) => {
    const newItems = form.items.map((item, i) => {
      if (i === index && item.type === "product") {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    updateItems(newItems);
  };

  const handleHourlyBreakChange = (index: number, breakTime: number) => {
    const newItems = form.items.map((item, i) => {
      if (i === index && item.type === "hourly") {
        return { ...item, breakTime: Math.max(0, breakTime) };
      }
      return item;
    });
    updateItems(newItems);
  };

  const handleHourlyStartTimeChange = (index: number, startTime: string) => {
    const newItems = form.items.map((item, i) => {
      if (i === index && item.type === "hourly") {
        return { ...item, startTime };
      }
      return item;
    });
    updateItems(newItems);
  };

  const handleHourlyEndTimeChange = (index: number, endTime: string) => {
    const newItems = form.items.map((item, i) => {
      if (i === index && item.type === "hourly") {
        return { ...item, endTime };
      }
      return item;
    });
    updateItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = form.items.filter((_, i) => i !== index);
    updateItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("customerId", form.customerId);
    fd.set("businessId", form.businessId);
    fd.set("numberType", form.numberType);
    if (form.numberType === "custom") {
      fd.set("number", form.number);
    }
    form.items.forEach((item, idx) => {
      fd.set(`items[${idx}][id]`, String(item.id));
      fd.set(`items[${idx}][type]`, item.type);
      if (item.type === "product") {
        fd.set(`items[${idx}][quantity]`, String(item.quantity));
      } else if (item.type === "hourly") {
        fd.set(`items[${idx}][breakTime]`, String(item.breakTime));
        fd.set(`items[${idx}][startTime]`, item.startTime || "");
        fd.set(`items[${idx}][endTime]`, item.endTime || "");
      }
    });
    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
        <Header />
        <Link
          href="/homePage"
          className="fixed left-4 top-[84px] z-50 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-flur px-3 py-2 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Retour à l'accueil"
          title="Retour à l'accueil"
        >
          <AiOutlineArrowLeft className="h-5 w-5 text-gray-800" />
        </Link>
        <main className="flex-1 pt-[80px]">
          <div className="max-w-4xl mx-auto px-6 pb-10">
            <div className="bg-white shadow-lg rounded-2xl p-8">
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                📄 Créer une nouvelle facture
              </h1>

              <form onSubmit={handleSubmit} aria-label="Create Invoice">
                <div className="space-y-6">
                  {/* Customer Name */}
                  <CustomerSelect
                    customers={customers}
                    value={form.customerId}
                    onChange={(val) => updateField("customerId", val)}
                    error={state.errors?.customerId}
                  />

                  {/* Business Name */}
                  <BusinessSelect
                    businesses={businesses}
                    value={form.businessId}
                    onChange={(val) => updateField("businessId", val)}
                    error={state.errors?.businessId}
                  />

                  {/* Invoice Number Type */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <label className="mb-3 block text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
                        />
                      </svg>
                      Numéro de facture
                    </label>
                    <div
                      className="flex gap-6 mb-4"
                      role="radiogroup"
                      aria-label="Invoice number type"
                    >
                      <label className="flex items-center gap-3 cursor-pointer bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                        <input
                          type="radio"
                          name="numberType"
                          value="auto"
                          checked={form.numberType === "auto"}
                          onChange={() => updateField("numberType", "auto")}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                            />
                          </svg>
                          <span className="font-medium text-gray-700">
                            Automatique
                          </span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                        <input
                          type="radio"
                          name="numberType"
                          value="custom"
                          checked={form.numberType === "custom"}
                          onChange={() => updateField("numberType", "custom")}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                          <span className="font-medium text-gray-700">
                            Personnalisé
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Invoice Number Input */}
                    {form.numberType === "custom" && (
                      <div>
                        <label
                          htmlFor="number"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Choisir un numéro de facture
                        </label>
                        <div className="relative">
                          <input
                            id="number"
                            name="number"
                            type="number"
                            value={form.number}
                            onChange={(e) =>
                              updateField("number", e.target.value)
                            }
                            placeholder="Entrer un numéro de facture"
                            className="w-full rounded-xl border border-gray-200 py-3 pl-12 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            min={1}
                            required
                          />
                          <svg
                            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
                            />
                          </svg>
                        </div>
                        {state.errors?.number && (
                          <div className="mt-2">
                            {state.errors.number.map((error: string) => (
                              <p className="text-sm text-red-500" key={error}>
                                {error}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Produits Section */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <label className="mb-3 block text-sm font-semibold text-gray-800">
                      📦 Produits
                    </label>
                    <div className="flex gap-3 mb-4">
                      <div className="relative flex-1">
                        <select
                          value={selectedProduct}
                          onChange={(e) =>
                            setSelectedProduct(
                              e.target.value === ""
                                ? -1
                                : Number(e.target.value)
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-10 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white appearance-none"
                        >
                          <option value="">Sélectionner un produit</option>
                          {productObjects
                            .filter(
                              (obj) =>
                                !form.items.some(
                                  (item) =>
                                    item.id === obj.id &&
                                    item.type === "product"
                                )
                            )
                            .map((obj) => (
                              <option key={obj.id} value={obj.id}>
                                {obj.name}
                              </option>
                            ))}
                        </select>
                        <svg
                          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                          />
                        </svg>
                        <svg
                          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        disabled={selectedProduct === -1}
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
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                        Ajouter
                      </button>
                    </div>
                    <ItemsList
                      items={form.items.filter(
                        (item) => item.type === "product"
                      )}
                      objects={objects}
                      onQuantityChange={handleProductQuantityChange}
                      onRemove={handleRemoveItem}
                      errors={state.errors}
                      originalIndices={form.items
                        .map((_, index) => index)
                        .filter(
                          (index) => form.items[index].type === "product"
                        )}
                    />
                  </div>

                  {/* Taux horaires Section */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <label className="mb-3 block text-sm font-semibold text-gray-800">
                      ⏱️ Taux horaires
                    </label>
                    <div className="flex gap-3 mb-4">
                      <div className="relative flex-1">
                        <select
                          value={selectedRate}
                          onChange={(e) =>
                            setSelectedRate(
                              e.target.value === ""
                                ? -1
                                : Number(e.target.value)
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-10 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white appearance-none"
                        >
                          <option value="">Sélectionner un taux horaire</option>
                          {hourlyObjects
                            .filter(
                              (obj) =>
                                !form.items.some(
                                  (item) =>
                                    item.id === obj.id && item.type === "hourly"
                                )
                            )
                            .map((obj) => (
                              <option key={obj.id} value={obj.id}>
                                {obj.name}
                              </option>
                            ))}
                        </select>
                        <svg
                          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                        <svg
                          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddRate}
                        className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        disabled={selectedRate === -1}
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
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                        Ajouter
                      </button>
                    </div>
                    <ItemsList
                      items={form.items.filter(
                        (item) => item.type === "hourly"
                      )}
                      objects={objects}
                      onBreakChange={handleHourlyBreakChange}
                      onStartTimeChange={handleHourlyStartTimeChange}
                      onEndTimeChange={handleHourlyEndTimeChange}
                      onRemove={handleRemoveItem}
                      errors={state.errors}
                      originalIndices={form.items
                        .map((_, index) => index)
                        .filter((index) => form.items[index].type === "hourly")}
                    />
                  </div>

                  {/* Error Messages */}
                  {state.message && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                      <svg
                        className="h-5 w-5 text-red-500 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                      <p className="text-sm text-red-600">{state.message}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <Link
                    href="/homePage"
                    className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
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
                    className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-blue-400 rounded-full"></span>
                        Création...
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
                        Créer la facture
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
