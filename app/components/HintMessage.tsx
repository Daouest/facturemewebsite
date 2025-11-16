"use client";

import React from "react";

type HintProps = {
  children: React.ReactNode;
  variant?: "warning" | "info" | "danger";
  className?: string;
  // ValidationWarning-compatible props (optional). If `canSubmit` is provided,
  // the component will render the same UI as the old `ValidationWarning`.
  canSubmit?: boolean;
  customerId?: string;
  businessId?: string;
  invoiceType?: "company" | "personal";
  itemsCount?: number;
  t?: (key: any) => string;
};

export default function HintMessage({
  children,
  variant = "warning",
  className = "",
  // validation props
  canSubmit,
  customerId,
  businessId,
  invoiceType,
  itemsCount,
  t,
}: HintProps) {
  // If validation props are provided, mimic ValidationWarning behaviour
  const hasValidationProps = typeof canSubmit === "boolean";

  if (hasValidationProps) {
    // Only show message when validation is incomplete (canSubmit is false)
    if (canSubmit === false) {
      // Render the ValidationWarning UI
      return (
        <div
          className={`mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 ${className}`}
        >
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 mt-0.5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {t
                  ? t("pleaseCompleteFields")
                  : "Please complete the required fields."}
              </p>
              <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
                {!customerId && (
                  <li>{t ? t("selectClient") : "Select a client"}</li>
                )}
                {invoiceType === "company" && !businessId && (
                  <li>{t ? t("selectBusiness") : "Select a business"}</li>
                )}
                {itemsCount === 0 && (
                  <li>
                    {t ? t("addAtLeastOneItem") : "Add at least one item"}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      );
    }
    // When canSubmit is true (all fields filled), don't display anything
    return null;
  }

  // If no validation props, always show the hint message (normal usage)
  const base = "rounded-md p-3";
  const variants: Record<string, string> = {
    warning: "border border-yellow-400/20 bg-yellow-500/6 text-yellow-200",
    info: "border border-sky-400/20 bg-sky-500/6 text-sky-200",
    danger: "border border-red-400/20 bg-red-500/6 text-red-200",
  };

  const vclass = variants[variant] ?? variants.warning;

  return (
    <div className={`mb-4 ${className}`}>
      <div className={`${base} ${vclass}`}>
        <p className="text-sm">{children}</p>
      </div>
    </div>
  );
}
