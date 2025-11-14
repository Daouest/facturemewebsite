"use client";

import {
  CustomerField,
  ItemFieldWithPrice,
  BusinessField,
  InvoiceForm,
} from "@/app/lib/definitions";
import {
  createItemKey,
  calculateWorkedHours,
  createTranslator,
} from "@/app/lib/utils";
import Link from "next/link";
import {
  createInvoice,
  InvoiceCreationFormState,
} from "@/app/lib/actions/invoice-creation-actions";
import { startTransition, useActionState } from "react";
import { useMemo, useState, useEffect, useId } from "react";
import CustomerSelect from "@/app/ui/invoices/CustomerSelect";
import BusinessSelect from "@/app/ui/invoices/BusinessSelect";
import InvoiceTypeSelector from "@/app/ui/invoices/InvoiceTypeSelector";
import { useLangageContext } from "@/app/context/langageContext";
import InvoiceNumberSection from "@/app/ui/invoices/InvoiceNumberSection";
import InvoiceDateSelector from "@/app/ui/invoices/InvoiceDateSelector";
import InvoiceSummary from "@/app/ui/invoices/InvoiceSummary";
import ProductsSection from "@/app/ui/invoices/ProductsSection";
import HourlyRatesSection from "@/app/ui/invoices/HourlyRatesSection";
import HintMessage from "@/app/components/HintMessage";

type Props = {
  customers: CustomerField[];
  businesses: BusinessField[];
  objects: ItemFieldWithPrice[];
};

export default function Form({ customers, businesses, objects }: Props) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  // ---------- Local form state ----------
  const [form, setForm] = useState<InvoiceForm>({
    customerId: "",
    businessId: "",
    invoiceType: "company",
    dateType: "current",
    invoiceDate: "",
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

  // Clear businessId when switching to personal invoice type
  useEffect(() => {
    if (form.invoiceType === "personal" && form.businessId) {
      updateField("businessId", "");
    }
  }, [form.invoiceType, form.businessId]);

  // ---------- Derived lists ----------
  const productObjects = useMemo(() => {
    const products = objects.filter((obj) => obj.type === "product");
    // Remove duplicates based on id
    const seen = new Set<number>();
    return products.filter((obj) => {
      if (seen.has(obj.id)) {
        return false;
      }
      seen.add(obj.id);
      return true;
    });
  }, [objects]);

  const hourlyObjects = useMemo(() => {
    const hourly = objects.filter((obj) => obj.type === "hourly");
    // Remove duplicates based on id
    const seen = new Set<number>();
    return hourly.filter((obj) => {
      if (seen.has(obj.id)) {
        return false;
      }
      seen.add(obj.id);
      return true;
    });
  }, [objects]);

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
    fd.set("invoiceType", form.invoiceType);
    fd.set("dateType", form.dateType);
    if (form.dateType === "future") {
      fd.set("invoiceDate", form.invoiceDate);
    }
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
    (form.invoiceType === "personal" || !!form.businessId) &&
    (form.numberType === "auto" ||
      (form.numberType === "custom" && !!form.number)) &&
    form.items.length > 0;

  return (
    <div className="pb-14">
      {/* Hero header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100">
          {t("createNewInvoice")}
        </h1>
      </div>

      {/* Required fields hint */}
      <div className="text-center">
        <HintMessage>{t("requiredFieldsAsterisk")}</HintMessage>
      </div>

      {/* Card shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main form column */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
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
                      {t("client")}
                      <span aria-hidden="true" className="text-rose-300 ml-1">
                        *
                      </span>
                    </h2>
                  </div>
                  <CustomerSelect
                    customers={customers}
                    value={form.customerId}
                    onChange={(val) => updateField("customerId", val)}
                    error={state.errors?.customerId}
                  />
                </section>

                {/* Invoice Type Selection */}
                <section className="rounded-xl ring-1 ring-white/10 bg-white/0 p-4">
                  <InvoiceTypeSelector
                    value={form.invoiceType}
                    onChange={(val) => updateField("invoiceType", val)}
                    disabled={isPending}
                    error={state.errors?.invoiceType}
                  />
                </section>

                {/* Business - Only show when invoice type is 'company' */}
                {form.invoiceType === "company" && (
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
                        {t("business")}
                        <span aria-hidden="true" className="text-rose-300 ml-1">
                          *
                        </span>
                      </h2>
                    </div>
                    <BusinessSelect
                      businesses={businesses}
                      value={form.businessId}
                      onChange={(val) => updateField("businessId", val)}
                      error={state.errors?.businessId}
                    />
                  </section>
                )}

                {/* Invoice Number Type */}
                <InvoiceNumberSection
                  form={form}
                  updateField={updateField}
                  numberGroupId={numberGroupId}
                  errors={state.errors}
                />

                {/* Date */}
                <InvoiceDateSelector
                  dateType={form.dateType}
                  invoiceDate={form.invoiceDate}
                  onDateTypeChange={(value) => updateField("dateType", value)}
                  onInvoiceDateChange={(value) =>
                    updateField("invoiceDate", value)
                  }
                  errors={state.errors?.invoiceDate}
                />

                {/* Produits */}
                <ProductsSection
                  productObjects={productObjects}
                  form={form}
                  selectedProduct={selectedProduct}
                  setSelectedProduct={setSelectedProduct}
                  handleAddItem={handleAddItem}
                  handleProductQuantityChange={handleProductQuantityChange}
                  handleRemoveItem={handleRemoveItem}
                  objects={objects}
                  errors={state.errors}
                />

                {/* Taux horaires */}
                <HourlyRatesSection
                  hourlyObjects={hourlyObjects}
                  form={form}
                  selectedRate={selectedRate}
                  setSelectedRate={setSelectedRate}
                  handleAddRate={handleAddRate}
                  handleHourlyBreakChange={handleHourlyBreakChange}
                  handleHourlyStartTimeChange={handleHourlyStartTimeChange}
                  handleHourlyEndTimeChange={handleHourlyEndTimeChange}
                  handleRemoveItem={handleRemoveItem}
                  objects={objects}
                  errors={state.errors}
                />

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

              {/* Validation (show validation warning when form incomplete, otherwise show security hint) */}
              <HintMessage
                canSubmit={canSubmit}
                customerId={form.customerId}
                businessId={form.businessId}
                invoiceType={form.invoiceType}
                itemsCount={form.items.length}
                t={t}
              >
                {t("clientsImmutableHint")}
              </HintMessage>

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
                  {t("cancel")}
                </Link>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
                  disabled={isPending || !canSubmit}
                  aria-disabled={isPending || !canSubmit}
                  aria-busy={isPending}
                  title={
                    !canSubmit
                      ? `${t("missing")}: ${
                          !form.customerId ? t("client") + ", " : ""
                        }${!form.businessId ? t("business") + ", " : ""}${
                          form.items.length === 0 ? t("products") + ", " : ""
                        }`.replace(/, $/, "")
                      : t("createInvoice")
                  }
                >
                  {isPending ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-sky-400 rounded-full" />
                      {t("creating")}
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
                      {t("createInvoice")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Side summary*/}
        <InvoiceSummary
          customers={customers}
          businesses={businesses}
          customerId={form.customerId}
          businessId={form.businessId}
          invoiceType={form.invoiceType}
          dateType={form.dateType}
          invoiceDate={form.invoiceDate}
          itemsCount={form.items.length}
          numberType={form.numberType}
          customNumber={form.number}
          invoiceTotal={invoiceTotal}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
}
