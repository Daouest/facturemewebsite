import { BusinessField } from "@/app/lib/definitions";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "@/app/context/langageContext";

export default function BusinessSelect({
  businesses,
  value,
  onChange,
  error,
}: {
  businesses: BusinessField[];
  value: string;
  onChange: (val: string) => void;
  error?: string[];
}) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  const hasError = !!error && error.length > 0;
  const errorId = "business-error";

  return (
    <div>
      <div className="relative">
        <select
          id="business"
          name="businessId"
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
            {t("selectBusinessLabel")}
          </option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>

        {/* Leading icon (building) */}
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
            d="M3.75 21h16.5M4.5 21V6.75A1.5 1.5 0 0 1 6 5.25h6A1.5 1.5 0 0 1 13.5 6.75V21M9 21v-3.75M15 21V9.75A1.5 1.5 0 0 1 16.5 8.25H18A1.5 1.5 0 0 1 19.5 9.75V21M7.5 8.25h3M7.5 11.25h3"
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
