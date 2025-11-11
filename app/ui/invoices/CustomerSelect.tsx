import { CustomerField } from "@/app/lib/definitions";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "@/app/context/langageContext";

export default function CustomerSelect({
  customers,
  value,
  onChange,
  error,
}: {
  customers: CustomerField[];
  value: string;
  onChange: (val: string) => void;
  error?: string[];
}) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const hasError = !!error && error.length > 0;
  const errorId = "customer-error";

  return (
    <div>
      <div className="relative">
        <select
          id="customer"
          name="customerId"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={[
            "w-full rounded-xl py-3 pl-12 pr-10 text-sm outline-none appearance-none",
            "bg-white/5 text-slate-100 placeholder:text-slate-400",
            "border",
            hasError
              ? "border-rose-400/40 focus:border-rose-400/60 focus:ring-2 focus:ring-rose-400/20"
              : "border-white/10 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20",
          ].join(" ")}
        >
          <option value="" disabled>
            {t("selectClientLabel")}
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>

        {/* Leading icon */}
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>

        {/* Chevron */}
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>

      {hasError && (
        <div id={errorId} className="mt-2 space-y-1">
          {error!.map((err) => (
            <p className="text-sm text-rose-400" key={err}>
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
