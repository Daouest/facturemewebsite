"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
};
/** * Button component with built-in loading state *  * @example * <LoadingButton  *   isLoading={isPending}  *   loadingText="Saving..." *   onClick={handleSubmit} * > *   Save Changes * </LoadingButton> */ export default function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  variant = "primary",
  fullWidth = false,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30",
    secondary:
      "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20",
    danger:
      "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-lg shadow-rose-500/30",
  };
  return (
    <button
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={clsx(
        baseStyles,
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {" "}
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {" "}
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />{" "}
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />{" "}
        </svg>
      )}{" "}
      <span>{isLoading && loadingText ? loadingText : children}</span>{" "}
    </button>
  );
}
