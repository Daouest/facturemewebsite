import React from "react";
import Link from "next/link";
interface ActionButton {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}
interface ActionsCardProps {
  actions: ActionButton[];
  className?: string;
}
export default function ActionsCard({
  actions,
  className = "",
}: ActionsCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] ${className}`}
    >
      {" "}
      <div className="space-y-3">
        {" "}
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={
              action.variant === "primary"
                ? "w-full inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-white font-medium shadow hover:bg-sky-400 transition-colors ring-1 ring-sky-400/40"
                : "w-full inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2 text-slate-200 font-medium hover:bg-white/10 transition-colors"
            }
          >
            {" "}
            {action.label}{" "}
          </Link>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
