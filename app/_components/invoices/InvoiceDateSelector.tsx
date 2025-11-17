'use client';

import React from 'react';
import { useLangageContext } from "@/app/_context/langageContext";
import { translations } from "@/app/_lib/utils/constants";
import Section from "@/app/_components/ui/Section";
import RadioGroup from "@/app/_components/shared/RadioGroup";

type InvoiceDateSelectorProps = {
  dateType: 'current' | 'future';
  invoiceDate: string;
  onDateTypeChange: (value: 'current' | 'future') => void;
  onInvoiceDateChange: (value: string) => void;
  errors?: string[];
};

const calendarIcon = (
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
);

export default function InvoiceDateSelector({
  dateType,
  invoiceDate,
  onDateTypeChange,
  onInvoiceDateChange,
  errors,
}: InvoiceDateSelectorProps) {
  const { langage } = useLangageContext();
  const t = translations[langage];
  
  const today = new Date().toISOString().split('T')[0];
  
  const options = [
    { value: 'current', label: t.currentDate },
    { value: 'future', label: t.futureDate },
  ];

  return (
    <Section 
      title={t.invoiceDate} 
      icon={calendarIcon} 
      iconBgColor="bg-sky-500/20 ring-sky-400/30"
    >
      <RadioGroup
        name="dateType"
        options={options}
        value={dateType}
        onChange={(val) => onDateTypeChange(val as 'current' | 'future')}
        ariaLabel={t.invoiceDate}
        error={errors}
        activeColor="sky"
      />

      {/* Date Picker (shown when Future Date is selected) */}
      {dateType === 'future' && (
        <div className="mt-4">
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
    </Section>
  );
}
