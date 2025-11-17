"use client";
import { useLangageContext } from "@/app/_context/langageContext";
import { createTranslator } from "@/app/_lib/utils/format";
import RadioGroup from "@/app/_components/shared/RadioGroup";
interface InvoiceTypeSelectorProps {
  value: "company" | "personal";
  onChange: (value: "company" | "personal") => void;
  disabled?: boolean;
  error?: string[];
  groupId?: string;
}
const invoiceIcon = (
  <svg
    className="h-4 w-4 text-violet-300"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    {" "}
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
    />{" "}
  </svg>
);
export default function InvoiceTypeSelector({
  value,
  onChange,
  disabled = false,
  error,
  groupId = "invoice-type-group",
}: InvoiceTypeSelectorProps) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const options = [
    { value: "company", label: t("withCompany") },
    { value: "personal", label: t("withPersonalAddress") },
  ];
  return (
    <div>
      {" "}
      <div className="mb-3 flex items-center gap-2">
        {" "}
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 ring-1 ring-violet-400/30">
          {" "}
          {invoiceIcon}{" "}
        </span>{" "}
        <h2 className="text-sm font-semibold text-slate-200">
          {" "}
          {t("invoiceType")}{" "}
        </h2>{" "}
      </div>{" "}
      <RadioGroup
        name="invoiceType"
        options={options}
        value={value}
        onChange={(val) => onChange(val as "company" | "personal")}
        disabled={disabled}
        error={error}
        groupId={groupId}
        ariaLabel={t("invoiceType")}
        activeColor="violet"
      />{" "}
    </div>
  );
}
