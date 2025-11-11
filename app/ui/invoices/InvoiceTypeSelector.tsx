"use client";

import { useLangageContext } from "@/app/context/langageContext";
import { createTranslator } from "@/app/lib/utils";

interface InvoiceTypeSelectorProps {
  value: "company" | "personal";
  onChange: (value: "company" | "personal") => void;
  disabled?: boolean;
  error?: string[];
  groupId?: string;
}

export default function InvoiceTypeSelector({
  value,
  onChange,
  disabled = false,
  error,
  groupId = "invoice-type-group",
}: InvoiceTypeSelectorProps) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const hasError = !!error && error.length > 0;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 ring-1 ring-violet-400/30">
          <svg
            className="h-4 w-4 text-violet-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
            />
          </svg>
        </span>
        <h2 className="text-sm font-semibold text-slate-200">
          {t("invoiceType")}
        </h2>
      </div>

      <div
        id={groupId}
        className="flex flex-wrap gap-3"
        role="radiogroup"
        aria-label={t("invoiceType")}
        aria-invalid={hasError}
      >
        <label
          className={`flex items-center gap-3 cursor-pointer rounded-lg px-4 py-2 border transition ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${
            value === "company"
              ? "border-violet-400/60 bg-violet-500/20 ring-1 ring-violet-400/30"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <input
            type="radio"
            name="invoiceType"
            value="company"
            checked={value === "company"}
            onChange={(e) => onChange(e.target.value as "company" | "personal")}
            disabled={disabled}
            className="h-4 w-4 text-violet-400"
          />
          <span className="text-sm text-slate-200">{t("withCompany")}</span>
        </label>

        <label
          className={`flex items-center gap-3 cursor-pointer rounded-lg px-4 py-2 border transition ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${
            value === "personal"
              ? "border-violet-400/60 bg-violet-500/20 ring-1 ring-violet-400/30"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <input
            type="radio"
            name="invoiceType"
            value="personal"
            checked={value === "personal"}
            onChange={(e) => onChange(e.target.value as "company" | "personal")}
            disabled={disabled}
            className="h-4 w-4 text-violet-400"
          />
          <span className="text-sm text-slate-200">
            {t("withPersonalAddress")}
          </span>
        </label>
      </div>

      {hasError && (
        <div className="mt-2 space-y-1">
          {error!.map((err) => (
            <p className="text-sm text-rose-400" key={err}>
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
