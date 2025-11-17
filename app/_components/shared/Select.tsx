"use client";
import { useLangageContext } from "@/app/_context/langageContext";
import { createTranslator } from "@/app/_lib/utils/format";
import { ReactNode } from "react";
export type SelectOption = { id: string | number; name: string };
type SelectProps = {
  id: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string[];
  icon?: ReactNode;
  required?: boolean;
};
export default function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  icon,
  required = false,
}: SelectProps) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const hasError = !!error && error.length > 0;
  const errorId = `${id}-error`;
  return (
    <div>
      {" "}
      <div className="relative">
        {" "}
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={[
            "w-full rounded-xl py-3 pr-10 text-sm outline-none appearance-none",
            icon ? "pl-12" : "pl-4",
            "bg-white/5 text-slate-100 placeholder:text-slate-400",
            "border",
            hasError
              ? "border-rose-400/40 focus:border-rose-400/60 focus:ring-2 focus:ring-rose-400/20"
              : "border-white/10 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20",
          ].join(" ")}
        >
          {" "}
          <option value="" disabled>
            {" "}
            {placeholder}{" "}
          </option>{" "}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {" "}
              {option.name}{" "}
            </option>
          ))}{" "}
        </select>{" "}
        {/* Leading icon */}{" "}
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {" "}
            {icon}{" "}
          </div>
        )}{" "}
        {/* Chevron */}{" "}
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />{" "}
        </svg>{" "}
      </div>{" "}
      {hasError && (
        <div id={errorId} className="mt-2 space-y-1">
          {" "}
          {error!.map((err) => (
            <p className="text-sm text-rose-400" key={err}>
              {" "}
              {err}{" "}
            </p>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
