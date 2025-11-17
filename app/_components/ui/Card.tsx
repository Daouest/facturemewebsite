import { cn } from "@/app/_lib/utils/format";
import { ReactNode } from "react";
interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "transparent";
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "section" | "article";
}
/** * Reusable Card component with consistent styling across the app *  * @example * <Card>Content here</Card> * <Card variant="gradient" padding="lg">Gradient card</Card> * <Card className="custom-class">With custom classes</Card> */ export default function Card({
  children,
  className = "",
  variant = "default",
  padding = "md",
  as: Component = "div",
}: CardProps) {
  const baseStyles =
    "rounded-2xl border shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]";
  const variantStyles = {
    default: "border-white/10 bg-white/5 backdrop-blur",
    gradient:
      "border-white/10 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 backdrop-blur",
    transparent: "border-white/10 bg-white/0 backdrop-blur",
  };
  const paddingStyles = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };
  return (
    <Component
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
    >
      {" "}
      {children}{" "}
    </Component>
  );
}
/** * Card variant specifically for loading states */ export function CardLoading({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <Card className="text-center">
      {" "}
      <div className="flex items-center justify-center min-h-[200px]">
        {" "}
        <div className="text-slate-300">{message}</div>{" "}
      </div>{" "}
    </Card>
  );
}
/** * Card variant specifically for error states */ export function CardError({
  message = "An error occurred",
}: {
  message?: string;
}) {
  return (
    <Card className="text-center">
      {" "}
      <div className="flex items-center justify-center min-h-[200px]">
        {" "}
        <div className="text-rose-300">{message}</div>{" "}
      </div>{" "}
    </Card>
  );
}
