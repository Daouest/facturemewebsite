import { CustomerField, BusinessField } from "@/app/lib/definitions";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "@/app/context/langageContext";

type Props = {
  customers: CustomerField[];
  businesses: BusinessField[];
  customerId: string;
  businessId: string;
  itemsCount: number;
  numberType: string;
  customNumber: string;
  invoiceTotal: number;
  formatCurrency: (amount: number) => string;
};

export default function InvoiceSummary({
  customers,
  businesses,
  customerId,
  businessId,
  itemsCount,
  numberType,
  customNumber,
  invoiceTotal,
  formatCurrency,
}: Props) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-[96px] space-y-6">
        {/* Summary Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
          <h3 className="text-sm font-semibold text-slate-200">
            {t("invoiceSummary")}
          </h3>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>{t("client")}</span>
              <span className="font-medium">
                {customers?.find((c) => c.id === Number(customerId))?.name ??
                  "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("business")}</span>
              <span className="font-medium">
                {businesses?.find((b) => b.id === Number(businessId))?.name ??
                  "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("items")}</span>
              <span className="font-medium">{itemsCount}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between">
              <span className="text-slate-300/80">{t("numbering")}</span>
              <span className="font-medium">
                {numberType === "auto"
                  ? t("automatic")
                  : `#${customNumber || "—"}`}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <span className="font-semibold text-slate-200">{t("total")}</span>
              <span className="text-lg font-bold text-sky-300">
                {formatCurrency(invoiceTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
