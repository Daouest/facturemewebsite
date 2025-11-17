import { CustomerField, BusinessField } from "@/app/_lib/types/definitions";
import { createTranslator } from "@/app/_lib/utils/format";
import { useLangageContext } from "@/app/_context/langageContext";

type Props = {
  customers: CustomerField[];
  businesses: BusinessField[];
  customerId: string;
  businessId: string;
  invoiceType: "company" | "personal";
  dateType: "current" | "future";
  invoiceDate: string;
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
  invoiceType,
  dateType,
  invoiceDate,
  itemsCount,
  numberType,
  customNumber,
  invoiceTotal,
  formatCurrency,
}: Props) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  // Format date for display - parse as local date to avoid timezone shift
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    
    // Parse the date string as local date (YYYY-MM-DD format)
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString(langage === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const displayDate = dateType === "future" && invoiceDate
    ? formatDate(invoiceDate)
    : new Date().toLocaleDateString(langage === "fr" ? "fr-FR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

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
                {customers?.find((c) => c.id === Number(customerId))?.name ?? "—"}
              </span>
            </div>
            
            {invoiceType === "company" && (
              <div className="flex justify-between">
                <span>{t("business")}</span>
                <span className="font-medium">
                  {businesses?.find((b) => b.id === Number(businessId))?.name ?? "—"}
                </span>
              </div>
            )}
            
            {invoiceType === "personal" && (
              <div className="flex justify-between">
                <span>{t("invoiceType")}</span>
                <span className="font-medium text-violet-300">
                  {t("personalInvoice")}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>{t("items")}</span>
              <span className="font-medium">{itemsCount}</span>
            </div>
            
            <div className="pt-2 border-t border-white/10 flex justify-between">
              <span className="text-slate-300/80">{t("invoiceDate")}</span>
              <span className="font-medium">{displayDate}</span>
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
