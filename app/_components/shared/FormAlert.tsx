"use client";
import { AiOutlineAlert } from "react-icons/ai";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
type FormAlertProps = {
  show: boolean;
  type: "success" | "error";
  message: string;
  title?: string;
  onClose?: () => void;
};
export default function FormAlert({
  show,
  type,
  message,
  title,
  onClose,
}: FormAlertProps) {
  if (!show) return null;
  const isError = type === "error";
  const defaultTitle = isError ? "Error" : "Success";
  return (
    <Alert
      variant={isError ? "destructive" : "default"}
      className={
        isError
          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
          : "border-green-500 bg-green-50 dark:bg-green-900/20"
      }
    >
      {" "}
      <AiOutlineAlert className="h-4 w-4" />{" "}
      <AlertTitle>{title || defaultTitle}</AlertTitle>{" "}
      <AlertDescription>{message}</AlertDescription>{" "}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close alert"
        >
          {" "}
          ×{" "}
        </button>
      )}{" "}
    </Alert>
  );
}
