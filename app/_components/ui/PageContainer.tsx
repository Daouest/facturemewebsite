import { ReactNode } from "react";
import { cn } from "@/app/_lib/utils/format";
interface PageContainerProps {
  children: ReactNode;
  className?: string;
  withGlows?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
}
/** * Reusable page container with consistent layout and decorative effects *  * @example * <PageContainer> *   <Card>Your content</Card> * </PageContainer> *  * <PageContainer withGlows={false} maxWidth="lg"> *   <Card>Narrower content without glows</Card> * </PageContainer> */ export default function PageContainer({
  children,
  className = "",
  withGlows = true,
  maxWidth = "7xl",
}: PageContainerProps) {
  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };
  return (
    <div className="relative w-full">
      {" "}
      {withGlows && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {" "}
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />{" "}
          <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />{" "}
        </div>
      )}{" "}
      <div
        className={cn(
          "relative z-10 w-full mx-auto px-6",
          maxWidthStyles[maxWidth],
          className,
        )}
      >
        {" "}
        {children}{" "}
      </div>{" "}
    </div>
  );
}
/** * Full page wrapper with background gradient */ interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}
export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800",
        className,
      )}
    >
      {" "}
      {children}{" "}
    </div>
  );
}
