"use client";

import { twMerge } from "tailwind-merge";

//source pour le tailwind-merge :
//https://www.haydenbleasel.com/blog/using-clsx-tailwind-composition?utm_source=chatgpt.com
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  isSelected?: boolean;
  fullWidth?: boolean;
};

export default function Button({
  variant = "primary",
  isSelected = false,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const base =
    // Base styles
    "relative inline-flex items-center border px-4 py-2 text-sm font-semibold transition-colors focus:z-10 focus:outline-none focus:ring-1";

  const variantStyles = {
    primary: twMerge(
      isSelected
        ? // Light-mode focus state
          "focus:border-teal-500 focus:ring-teal-500"
        : // Dark-mode focus state
          "dark:focus:border-teal-400 dark:focus:ring-teal-400",
    ),
    secondary: twMerge(
      isSelected
        ? // Selected / hover states
          "border-teal-500 bg-teal-500 text-white hover:bg-teal-600"
        : // Unselected / hover state
          "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
    ),
  };

  return (
    <button
      className={twMerge(
        base,
        variantStyles[variant],
        fullWidth && "w-full",
        className,
        className,
      )}
      {...props}
    />
  );
}
