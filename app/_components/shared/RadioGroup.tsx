"use client";
import { ReactNode } from "react";
import clsx from "clsx";
export type RadioOption = { value: string; label: string };
type RadioGroupProps = {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string[];
  groupId?: string;
  ariaLabel?: string;
  /** Active radio style - 'violet' (default) or 'sky' */ activeColor?:
    | "violet"
    | "sky";
};
export default function RadioGroup({
  name,
  options,
  value,
  onChange,
  disabled = false,
  error,
  groupId,
  ariaLabel,
  activeColor = "violet",
}: RadioGroupProps) {
  const hasError = !!error && error.length > 0;
  const activeStyles = {
    violet: "border-violet-400/60 bg-violet-500/20 ring-1 ring-violet-400/30",
    sky: "border-sky-400/60 bg-sky-500/20 ring-1 ring-sky-400/30",
  };
  const activeClass = activeStyles[activeColor];
  const inactiveClass = "border-white/10 bg-white/5 hover:bg-white/10";
  return (
    <div>
      {" "}
      <div
        id={groupId}
        className="flex flex-wrap gap-3"
        role="radiogroup"
        aria-label={ariaLabel}
        aria-invalid={hasError}
      >
        {" "}
        {options.map((option) => {
          const isChecked = value === option.value;
          return (
            <label
              key={option.value}
              className={clsx(
                "flex items-center gap-3 cursor-pointer rounded-lg px-4 py-2 border transition",
                disabled && "opacity-50 cursor-not-allowed",
                isChecked ? activeClass : inactiveClass,
              )}
            >
              {" "}
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isChecked}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={clsx(
                  "h-4 w-4",
                  activeColor === "violet" ? "text-violet-400" : "text-sky-400",
                )}
              />{" "}
              <span className="text-sm text-slate-200">
                {option.label}
              </span>{" "}
            </label>
          );
        })}{" "}
      </div>{" "}
      {hasError && (
        <div className="mt-2 space-y-1">
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
