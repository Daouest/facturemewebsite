"use client";

import {
  CustomerField,
  ItemFieldWithPrice,
  BusinessField,
  InvoiceForm,
} from "@/app/lib/definitions";
import { createItemKey, calculateWorkedHours } from "@/app/lib/utils";
import Link from "next/link";
import {
  createInvoice,
  InvoiceCreationFormState,
} from "@/app/lib/actions/invoice-creation-actions";
import { startTransition, useActionState } from "react";
import { useMemo, useState, useEffect, useId } from "react";
import CustomerSelect from "@/app/ui/invoices/CustomerSelect";
import BusinessSelect from "@/app/ui/invoices/BusinessSelect";
import ItemsList from "@/app/ui/invoices/ItemsList";

type Props = {
  customers: CustomerField[];
  businesses: BusinessField[];
  objects: ItemFieldWithPrice[];
};

export default function Form({ customers, businesses, objects }: Props) {
  // ---------- Local form state ----------
  const [form, setForm] = useState<InvoiceForm>({
    customerId: "",
    businessId: "",
    numberType: "auto",
    number: "",
    items: [],
  });

  const initialState: InvoiceCreationFormState = useMemo(
    () => ({ message: null, errors: {}, formData: form }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [state, formAction, isPending] = useActionState(
    createInvoice,
    initialState
  );

  const updateField = <K extends keyof InvoiceForm>(
    field: K,
    value: InvoiceForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateItems = (newItems: InvoiceForm["items"]) => {
    setForm((prev) => ({ ...prev, items: newItems }));
  };

  // Only sync back on validation errors from server action
  useEffect(() => {
    if (
      state.errors &&
      state.formData &&
      Object.keys(state.errors).length > 0
    ) {
      setForm(state.formData);
    }
  }, [state.errors, state.formData]);

  // ---------- Derived lists ----------
  const productObjects = useMemo(
    () => objects.filter((obj) => obj.type === "product"),
    [objects]
  );
  const hourlyObjects = useMemo(
    () => objects.filter((obj) => obj.type === "hourly"),
    [objects]
  );

  // ---------- Calculate total ----------
  const invoiceTotal = useMemo(() => {
    return form.items.reduce((total, item) => {
      const obj = objects.find((o) => o.id === item.id);
      if (!obj) return total;

      if (item.type === "product") {
        const price = obj.type === "product" ? obj.price : 0;
        return total + price * item.quantity;
      } else if (item.type === "hourly") {
        const rate = obj.type === "hourly" ? obj.hourlyRate : 0;
        if (item.startTime && item.endTime) {
          const hours = calculateWorkedHours(
            item.startTime,
            item.endTime,
            item.breakTime
          );
          return total + rate * hours;
        }
      }
      return total;
    }, 0);
  }, [form.items, objects]);

  // Currency formatter
  const formatCurrency = (amount: number): string => {
    if (amount > 1000000) {
      return "lots!";
    }
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // ---------- Select controls ----------
  const [selectedProduct, setSelectedProduct] = useState<number>(-1);
  const [selectedRate, setSelectedRate] = useState<number>(-1);

  const handleAddItem = () => {
    if (selectedProduct === -1) return;
    const key = createItemKey(selectedProduct, "product");
    if (!form.items.some((i) => createItemKey(i.id, i.type) === key)) {
      updateItems([
        ...form.items,
        { id: selectedProduct, type: "product", quantity: 1 },
      ]);
    }
    setSelectedProduct(-1);
  };

  const handleAddRate = () => {
    if (selectedRate === -1) return;
    const key = createItemKey(selectedRate, "hourly");
    if (!form.items.some((i) => createItemKey(i.id, i.type) === key)) {
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
    }
    setSelectedRate(-1);
  };

  // ---------- Item handlers ----------
  const handleProductQuantityChange = (index: number, quantity: number) => {
    const newItems = form.items.map((item, i) =>
      i === index && item.type === "product"
        ? {
            ...item,
            quantity: Math.max(1, Number.isFinite(quantity) ? quantity : 1),
          }
        : item
    );
    updateItems(newItems);
  };

  const handleHourlyBreakChange = (index: number, breakTime: number) => {
    const newItems = form.items.map((item, i) =>
      i === index && item.type === "hourly"
        ? {
            ...item,
            breakTime: Math.max(0, Number.isFinite(breakTime) ? breakTime : 0),
          }
        : item
    );
    updateItems(newItems);
  };

  const handleHourlyStartTimeChange = (index: number, startTime: string) => {
    const newItems = form.items.map((item, i) =>
      i === index && item.type === "hourly" ? { ...item, startTime } : item
    );
    updateItems(newItems);
  };

  const handleHourlyEndTimeChange = (index: number, endTime: string) => {
    const newItems = form.items.map((item, i) =>
      i === index && item.type === "hourly" ? { ...item, endTime } : item
    );
    updateItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    updateItems(form.items.filter((_, i) => i !== index));
  };

  // ---------- Submit ----------
  const numberGroupId = useId();

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
      } else {
        fd.set(`items[${idx}][breakTime]`, String(item.breakTime));
        fd.set(`items[${idx}][startTime]`, item.startTime || "");
        fd.set(`items[${idx}][endTime]`, item.endTime || "");
      }
    });

    startTransition(() => formAction(fd));
  };

  const canSubmit =
    !!form.customerId &&
    !!form.businessId &&
    (form.numberType === "auto" ||
      (form.numberType === "custom" && !!form.number)) &&
    form.items.length > 0;

  return (
    <div className="pb-14">
      {/* Hero header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
          Créer une nouvelle facture
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Renseignez le client, l'entreprise, puis ajoutez vos produits et taux
          horaires.
        </p>
      </div>

      {/* Card shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main form column */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
            <form
              onSubmit={handleSubmit}
              aria-label="Create Invoice"
              noValidate
            >
              <div className="space-y-6">
                {/* Customer */}
                <section className="rounded-xl ring-1 ring-white/10 bg-white/0 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 ring-1 ring-sky-400/30">
                      <svg
                        className="h-4 w-4 text-sky-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19.5A3.5 3.5 0 1 0 8 19.5 3.5 3.5 0 0 0 15 19.5ZM12 14a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"
                        />
                      </svg>
                    </span>
                    <h2 className="text-sm font-semibold text-slate-200">
                      Client
                    </h2>
                  </div>
                  <CustomerSelect
                    customers={customers}
                    value={form.customerId}
                    onChange={(val) => updateField("customerId", val)}
                    error={state.errors?.customerId}
                  />
                </section>

                {/* Business */}
                <section className="rounded-xl ring-1 ring-white/10 bg-white/0 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-400/30">
                      <svg
                        className="h-4 w-4 text-emerald-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 21h18M4.5 21V8.25A2.25 2.25 0 0 1 6.75 6h10.5A2.25 2.25 0 0 1 19.5 8.25V21M9 21V12h6v9"
                        />
                      </svg>
                    </span>
                    <h2 className="text-sm font-semibold text-slate-200">
                      Entreprise
                    </h2>
                  </div>
                  <BusinessSelect
                    businesses={businesses}
                    value={form.businessId}
                    onChange={(val) => updateField("businessId", val)}
                    error={state.errors?.businessId}
                  />
                </section>

                {/* Invoice Number Type */}
                <section className="rounded-xl ring-1 ring-white/10 bg-white/0 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/20 ring-1 ring-fuchsia-400/30">
                      <svg
                        className="h-4 w-4 text-fuchsia-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 7h14M5 12h14M5 17h14"
                        />
                      </svg>
                    </span>
                    <h2 className="text-sm font-semibold text-slate-200">
                      Numéro de facture
                    </h2>
                  </div>

                  <div
                    id={numberGroupId}
                    className="flex flex-wrap gap-3 mb-4"
                    role="radiogroup"
                    aria-label="Invoice number type"
                  >
                    <label className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 border border-white/10 bg-white/5 hover:bg-white/10 transition">
                      <input
                        type="radio"
                        name="numberType"
                        value="auto"
                        checked={form.numberType === "auto"}
                        onChange={() => updateField("numberType", "auto")}
                        className="h-4 w-4 text-sky-400"
                      />
                      <span className="text-sm">Automatique</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 border border-white/10 bg-white/5 hover:bg-white/10 transition">
                      <input
                        type="radio"
                        name="numberType"
                        value="custom"
                        checked={form.numberType === "custom"}
                        onChange={() => updateField("numberType", "custom")}
                        className="h-4 w-4 text-sky-400"
                      />
                      <span className="text-sm">Personnalisé</span>
                    </label>
                  </div>

                  {form.numberType === "custom" && (
                    <div>
                      <label
                        htmlFor="number"
                        className="mb-2 block text-sm font-medium text-slate-200"
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
                          className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-400 py-3 pl-12 text-sm outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                          min={1}
                          required
                          inputMode="numeric"
                        />
                        <svg
                          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          aria-hidden="true"
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
                            <p className="text-sm text-rose-400" key={error}>
                              {error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Produits */}
                <section className="rounded-xl ring-1 ring-white/10 bg-white/0 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 ring-1 ring-amber-400/30">
                      <span className="text-amber-300">📦</span>
                    </span>
                    <h2 className="text-sm font-semibold text-slate-200">
                      Produits
                    </h2>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <select
                        value={
                          selectedProduct === -1 ? "" : String(selectedProduct)
                        }
                        onChange={(e) =>
                          setSelectedProduct(
                            e.target.value === "" ? -1 : Number(e.target.value)
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 py-3 pl-12 pr-10 text-sm outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 appearance-none"
                      >
                        <option value="">Sélectionner un produit</option>
                        {productObjects
                          .filter(
                            (obj) =>
                              !form.items.some(
                                (item) =>
                                  item.id === obj.id && item.type === "product"
                              )
                          )
                          .map((obj) => (
                            <option key={obj.id} value={obj.id}>
                              {obj.name}
                            </option>
                          ))}
                      </select>

                      <svg
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                        />
                      </svg>
                      <svg
                        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        aria-hidden="true"
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
                      className="px-4 py-3 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      disabled={selectedProduct === -1}
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      Ajouter
                    </button>
                  </div>

                  <ItemsList
                    items={form.items.filter((item) => item.type === "product")}
                    objects={objects}
                    onQuantityChange={handleProductQuantityChange}
                    onRemove={handleRemoveItem}
                    errors={state.errors}
                    originalIndices={form.items
                      .map((_, index) => index)
                      .filter((index) => form.items[index].type === "product")}
                  />
                </section>

                {/* Taux horaires */}
                <section className="rounded-xl ring-1 ring-white/10 bg-white/0 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30">
                      <span className="text-indigo-300">⏱️</span>
                    </span>
                    <h2 className="text-sm font-semibold text-slate-200">
                      Taux horaires
                    </h2>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <select
                        value={selectedRate === -1 ? "" : String(selectedRate)}
                        onChange={(e) =>
                          setSelectedRate(
                            e.target.value === "" ? -1 : Number(e.target.value)
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 py-3 pl-12 pr-10 text-sm outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 appearance-none"
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
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <svg
                        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        aria-hidden="true"
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
                      className="px-4 py-3 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      disabled={selectedRate === -1}
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      Ajouter
                    </button>
                  </div>

                  <ItemsList
                    items={form.items.filter((item) => item.type === "hourly")}
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
                </section>

                {/* Global error */}
                {state.message && (
                  <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 flex items-center gap-3">
                    <svg
                      className="h-5 w-5 text-rose-300 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                      />
                    </svg>
                    <p className="text-sm text-rose-300">{state.message}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Link
                  href="/homePage"
                  className="px-6 py-3 rounded-xl bg-white/5 text-slate-200 font-medium hover:bg-white/10 transition-colors flex items-center gap-2 border border-white/10"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                  Annuler
                </Link>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
                  disabled={isPending || !canSubmit}
                  aria-disabled={isPending || !canSubmit}
                  aria-busy={isPending}
                  title={
                    !canSubmit
                      ? "Veuillez compléter les champs requis"
                      : "Créer la facture"
                  }
                >
                  {isPending ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-sky-400 rounded-full" />
                      Création...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="1.5"
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

        {/* Side summary*/}
        <aside className="lg:col-span-4">
          <div className="sticky top-[96px] space-y-6">
            {/* Summary Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
              <h3 className="text-sm font-semibold text-slate-200">
                Résumé facture
              </h3>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Client</span>
                  <span className="font-medium">
                    {customers?.find((c) => c.id === Number(form.customerId))
                      ?.name ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Entreprise</span>
                  <span className="font-medium">
                    {businesses?.find((b) => b.id === Number(form.businessId))
                      ?.name ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Articles</span>
                  <span className="font-medium">{form.items.length}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between">
                  <span className="text-slate-300/80">Numérotation</span>
                  <span className="font-medium">
                    {form.numberType === "auto"
                      ? "Automatique"
                      : `#${form.number || "—"}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="font-semibold text-slate-200">Total</span>
                  <span className="text-lg font-bold text-sky-300">
                    {formatCurrency(invoiceTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
