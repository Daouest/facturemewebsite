import { InvoiceForm } from "@/app/_lib/types/definitions";
import { createTranslator } from "@/app/_lib/utils/format";
import { useLangageContext } from "@/app/_context/langageContext";
import Section from "@/app/_components/ui/Section";
import RadioGroup from "@/app/_components/shared/RadioGroup";
type Props = {
  form: InvoiceForm;
  updateField: <K extends keyof InvoiceForm>(
    field: K,
    value: InvoiceForm[K],
  ) => void;
  numberGroupId: string;
  errors?: {
    customerId?: string[];
    number?: string[];
    businessId?: string[];
    invoiceType?: string[];
    items?: { [itemIndex: number]: { [field: string]: string[] } };
    general?: string[];
  };
};
const numberIcon = (
  <svg
    className="h-4 w-4 text-fuchsia-300"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    {" "}
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 7h14M5 12h14M5 17h14"
    />{" "}
  </svg>
);
export default function InvoiceNumberSection({
  form,
  updateField,
  numberGroupId,
  errors,
}: Props) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const options = [
    { value: "auto", label: t("automatic") },
    { value: "custom", label: t("custom") },
  ];
  return (
    <Section
      title={t("invoiceNumber")}
      icon={numberIcon}
      iconBgColor="bg-fuchsia-500/20 ring-fuchsia-400/30"
    >
      {" "}
      <RadioGroup
        name="numberType"
        options={options}
        value={form.numberType}
        onChange={(val) => updateField("numberType", val as "auto" | "custom")}
        groupId={numberGroupId}
        ariaLabel="Invoice number type"
        activeColor="sky"
      />{" "}
      {form.numberType === "custom" && (
        <div className="mt-4">
          {" "}
          <label
            htmlFor="number"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            {" "}
            {t("chooseInvoiceNumber")}{" "}
          </label>{" "}
          <div className="relative">
            {" "}
            <input
              id="number"
              name="number"
              type="number"
              value={form.number}
              onChange={(e) => updateField("number", e.target.value)}
              placeholder={t("enterInvoiceNumber")}
              className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-400 py-3 pl-12 text-sm outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
              min={1}
              required
              inputMode="numeric"
            />{" "}
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
              />{" "}
            </svg>{" "}
          </div>{" "}
          {errors?.number && (
            <div className="mt-2">
              {" "}
              {errors.number.map((error: string) => (
                <p className="text-sm text-rose-400" key={error}>
                  {" "}
                  {error}{" "}
                </p>
              ))}{" "}
            </div>
          )}{" "}
        </div>
      )}{" "}
    </Section>
  );
}
