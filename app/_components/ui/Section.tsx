import { cn } from "@/app/_lib/utils/format";
import { ReactNode } from "react";
interface SectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  as?: "section" | "div";
}
/** * Reusable Section component for form sections and content areas *  * @example * <Section title="Customer" icon={<UserIcon />}> *   <CustomerSelect /> * </Section> */ export default function Section({
  children,
  className = "",
  title,
  icon,
  iconBgColor = "bg-sky-500/20 ring-sky-400/30",
  as: Component = "section",
}: SectionProps) {
  return (
    <Component
      className={cn(
        "rounded-xl ring-1 ring-white/10 bg-white/0 p-4",
        className,
      )}
    >
      {" "}
      {(title || icon) && (
        <div className="mb-3 flex items-center gap-2">
          {" "}
          {icon && (
            <span
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1",
                iconBgColor,
              )}
            >
              {" "}
              {icon}{" "}
            </span>
          )}{" "}
          {title && (
            <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
          )}{" "}
        </div>
      )}{" "}
      {children}{" "}
    </Component>
  );
}
