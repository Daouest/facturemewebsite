"use client";

import React from "react";
import { useLangageContext } from "@/app/context/langageContext";
import { translations } from "@/app/lib/constante";
import { Calendar } from "lucide-react";

type InvoiceDateSelectorProps = {
  dateType: "current" | "future";
  invoiceDate: string;
  onDateTypeChange: (value: "current" | "future") => void;
  onInvoiceDateChange: (value: string) => void;
  errors?: string[];
};

export default function InvoiceDateSelector({
  dateType,
  invoiceDate,
  onDateTypeChange,
  onInvoiceDateChange,
  errors,
}: InvoiceDateSelectorProps) {
  const { langage } = useLangageContext();
  const t = translations[langage];

  const today = new Date().toISOString().split("T")[0];
  const hasError = !!errors && errors.length > 0;

  return (
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </span>
        <h2 className="text-sm font-semibold text-slate-200">
          {t.invoiceDate}
        </h2>
      </div>

      <div className="flex gap-3 mb-4">
        <label htmlFor="dateType" className="sr-only">
          {t.invoiceDate}
        </label>
        <div className="relative flex-1">
          <Calendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <select
            id="dateType"
            name="dateType"
            value={dateType}
            onChange={(e) =>
              onDateTypeChange(e.target.value as "current" | "future")
            }
            aria-invalid={hasError}
            className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 py-3 pl-12 pr-10 text-sm outline-none appearance-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
          >
            <option value="current">{t.currentDate}</option>
            <option value="future">{t.futureDate}</option>
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

      {/* Date Picker (shown when Future Date is selected) */}
      {dateType === "future" && (
        <div>
          <label
            htmlFor="invoiceDate"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            {t.selectInvoiceDate}
          </label>
          <div className="relative">
            <input
              id="invoiceDate"
              name="invoiceDate"
              type="date"
              value={invoiceDate}
              onChange={(e) => onInvoiceDateChange(e.target.value)}
              min={today}
              className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-400 py-3 pl-12 text-sm outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {t.dateMustBeTodayOrLater}
          </p>
        </div>
      )}

      {hasError && (
        <div className="mt-2">
          {errors!.map((error: string) => (
            <p className="text-sm text-rose-400" key={error}>
              {error}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
