import {
  CustomerField,
  BusinessField,
  InvoiceForm,
} from "@/app/lib/definitions";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "@/app/context/langageContext";

type Props = {
  customers: CustomerField[];
  businesses: BusinessField[];
  form: InvoiceForm;
  updateField: (field: keyof InvoiceForm, value: any) => void;
  errors?: Record<string, string[]>;
};

export default function CustomerBusinessSection({
  customers,
  businesses,
  form,
  updateField,
  errors,
}: Props) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <section className="rounded-xl ring-1 ring-white/10 bg-white/0 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 ring-1 ring-blue-400/30">
          <span className="text-blue-300">👤</span>
        </span>
        <h2 className="text-sm font-semibold text-slate-200">
          {t("clientAndBusiness")}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Selection */}
        <div className="relative">
          <label className="mb-2 block text-sm font-medium text-slate-200">
            {t("selectClientLabel")}
          </label>
          <select
            id="customer"
            name="customerId"
            value={form.customerId}
            onChange={(e) => updateField("customerId", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 py-3 pl-12 pr-10 text-sm outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 appearance-none"
            aria-describedby="customer-error"
          >
            <option value="">{t("chooseClient")}</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          <svg
            className="pointer-events-none absolute left-4 top-[44px] h-5 w-5 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <svg
            className="pointer-events-none absolute right-4 top-[44px] h-5 w-5 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>

          {errors?.customerId && (
            <div id="customer-error" aria-live="polite" aria-atomic="true">
              {errors.customerId.map((error: string) => (
                <p className="mt-2 text-sm text-red-400" key={error}>
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Business Selection */}
        <div className="relative">
          <label className="mb-2 block text-sm font-medium text-slate-200">
            {t("selectBusinessLabel")}
          </label>
          <select
            id="business"
            name="businessId"
            value={form.businessId}
            onChange={(e) => updateField("businessId", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 py-3 pl-12 pr-10 text-sm outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 appearance-none"
            aria-describedby="business-error"
          >
            <option value="">{t("chooseBusiness")}</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>

          <svg
            className="pointer-events-none absolute left-4 top-[44px] h-5 w-5 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
            />
          </svg>
          <svg
            className="pointer-events-none absolute right-4 top-[44px] h-5 w-5 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>

          {errors?.businessId && (
            <div id="business-error" aria-live="polite" aria-atomic="true">
              {errors.businessId.map((error: string) => (
                <p className="mt-2 text-sm text-red-400" key={error}>
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
