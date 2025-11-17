"use client";
import clsx from "clsx";
import { memo } from "react";
type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
  /** Layout: 'stacked' (default) or 'horizontal' for side-by-side label */ layout?:
    | "stacked"
    | "horizontal";
  /** Label width for horizontal layout (default: 'sm:w-1/3') */ labelWidth?: string;
};
function FormInput({
  error,
  label,
  layout = "stacked",
  labelWidth = "sm:w-1/3",
  className,
  ...props
}: FormInputProps) {
  const isHorizontal = layout === "horizontal";
  return (
    <div
      className={clsx(
        "w-full mb-4",
        isHorizontal && "flex flex-col sm:flex-row sm:items-center gap-3",
      )}
    >
      {" "}
      {label && (
        <label
          htmlFor={props.id || props.name}
          className={clsx(
            "font-semibold",
            isHorizontal
              ? `text-black ${labelWidth}`
              : "mb-1 text-sm text-gray-700 dark:text-gray-200",
          )}
        >
          {" "}
          {label}:{" "}
        </label>
      )}{" "}
      <input
        className={clsx(
          "border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          isHorizontal ? "h-10 w-full sm:flex-1" : "w-full",
          error
            ? "border-red-500"
            : "border-gray-300 dark:bg-zinc-900 dark:text-gray-200",
          className,
        )}
        id={props.id || props.name}
        {...props}
      />{" "}
      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}{" "}
    </div>
  );
}
export default memo(FormInput);
