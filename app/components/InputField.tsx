"use client";
import { memo } from "react";

interface InputFieldProps {
  name: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  value: string | number;
  required?: boolean;
  hasAccept?: boolean;
  accept?: string;
  autoComplete?: string;
}
function InputField({
  label,
  name,
  value,
  onChange,
  required = false,
  hasAccept = false,
  autoComplete = "on",
  type = "text",
}: InputFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <label htmlFor={name} className="text-black font-semibold sm:w-1/3">
        {label}:
      </label>
      {!hasAccept ? (
        <input
          className="h-10 w-full sm:flex-1 border rounded px-3 py-2"
          type={type}
          autoComplete={autoComplete}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
        />
      ) : (
        <input
          className="h-10 w-full sm:flex-1 border rounded px-3 py-2"
          type={type}
          id={name}
          onChange={onChange}
          accept="image/*"
        />
      )}
    </div>
  );
}

export default memo(InputField);
