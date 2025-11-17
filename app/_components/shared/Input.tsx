"use client";

import clsx from "clsx";

// les éléments "input" ont plusieurs attributs de base.
// Par exemple, l'attribut "autocomplete" utilise l'assistance
// du furteur pour venir compléter les champs
// il existe plusieurs autres attributs comme "given-name", "family-name" ou encore, "email".
// source : https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export default function Input({
  error,
  label,
  className,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col w-full mb-4">
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-900 dark:text-gray-200",
          error ? "border-red-500" : "border-gray-300",
          className
        )}
        {...props}
      />
      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
    </div>
  );
}

