"use client";

import { InvoiceForm } from "@/app/lib/definitions";
import { Hash } from "lucide-react";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "@/app/context/langageContext";

type Props = {
  form: InvoiceForm;
  updateField: <K extends keyof InvoiceForm>(
    field: K,
    value: InvoiceForm[K]
  ) => void;
  numberGroupId?: string;
  errors?: {
    customerId?: string[];
    number?: string[];
    businessId?: string[];
    invoiceType?: string[];
    items?: { [itemIndex: number]: { [field: string]: string[] } };
    general?: string[];
  };
};

export default function InvoiceNumberSection({
  form,
  updateField,
  numberGroupId,
  errors,
}: Props) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
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
          {t("invoiceNumber")}
        </h2>
      </div>

      <div className="flex gap-3 mb-4">
        <label htmlFor="numberType" className="sr-only">
          {t("chooseInvoiceNumber")}
        </label>
        <div className="relative flex-1">
          <Hash className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <select
            id="numberType"
            name="numberType"
            value={form.numberType}
            onChange={(e) =>
              updateField("numberType", e.target.value as "auto" | "custom")
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 py-3 pl-12 pr-10 text-sm outline-none appearance-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
          >
            <option value="auto">{t("automatic")}</option>
            <option value="custom">{t("custom")}</option>
          </select>

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
      </div>

      {form.numberType === "custom" && (
        <div>
          <label
            htmlFor="number"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            {t("chooseInvoiceNumber")}
            <span aria-hidden="true" className="text-rose-300 ml-1">
              *
            </span>
          </label>

          <div className="relative">
            <input
              id="number"
              name="number"
              type="number"
              value={form.number}
              onChange={(e) => updateField("number", e.target.value)}
              placeholder={t("enterInvoiceNumber")}
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

          {errors?.number && (
            <div className="mt-2 space-y-1">
              {errors.number.map((error: string) => (
                <p className="text-sm text-rose-400" key={error}>
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
