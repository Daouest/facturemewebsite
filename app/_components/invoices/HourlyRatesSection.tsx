import { ItemFieldWithPrice, InvoiceForm } from "@/app/_lib/types/definitions";
import ItemsList from "@/app/_components/invoices/ItemsList";
import { createTranslator } from "@/app/_lib/utils/format";
import { useLangageContext } from "@/app/_context/langageContext";
import Section from "@/app/_components/ui/Section";
type Props = {
  hourlyObjects: ItemFieldWithPrice[];
  form: InvoiceForm;
  selectedRate: number;
  setSelectedRate: (val: number) => void;
  handleAddRate: () => void;
  handleHourlyBreakChange: (index: number, breakTime: number) => void;
  handleHourlyStartTimeChange: (index: number, startTime: string) => void;
  handleHourlyEndTimeChange: (index: number, endTime: string) => void;
  handleRemoveItem: (id: number, type: "product" | "hourly") => void;
  objects: ItemFieldWithPrice[];
  errors?: {
    customerId?: string[];
    number?: string[];
    businessId?: string[];
    invoiceType?: string[];
    items?: { [itemIndex: number]: { [field: string]: string[] } };
    general?: string[];
  };
};
const hourlyIcon = <span className="text-emerald-300">⏱️</span>;
export default function HourlyRatesSection({
  hourlyObjects,
  form,
  selectedRate,
  setSelectedRate,
  handleAddRate,
  handleHourlyBreakChange,
  handleHourlyStartTimeChange,
  handleHourlyEndTimeChange,
  handleRemoveItem,
  objects,
  errors,
}: Props) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);
  return (
    <Section
      title={t("hourlyRate")}
      icon={hourlyIcon}
      iconBgColor="bg-emerald-500/20 ring-emerald-400/30"
    >
      {" "}
      <div className="flex gap-3 mb-4">
        {" "}
        <div className="relative flex-1">
          {" "}
          <select
            value={selectedRate === -1 ? "" : String(selectedRate)}
            onChange={(e) =>
              setSelectedRate(
                e.target.value === "" ? -1 : Number(e.target.value),
              )
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 py-3 pl-12 pr-10 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 appearance-none"
          >
            {" "}
            <option value="">{t("selectHourlyRate")}</option>{" "}
            {hourlyObjects
              .filter(
                (obj) =>
                  !form.items.some(
                    (item) => item.id === obj.id && item.type === "hourly",
                  ),
              )
              .map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {" "}
                  {obj.name}{" "}
                </option>
              ))}{" "}
          </select>{" "}
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
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />{" "}
          </svg>{" "}
          <svg
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />{" "}
          </svg>{" "}
        </div>{" "}
        <button
          type="button"
          onClick={handleAddRate}
          className="px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          disabled={selectedRate === -1}
        >
          {" "}
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            {" "}
            <path
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />{" "}
          </svg>{" "}
          {t("add")}{" "}
        </button>{" "}
      </div>{" "}
      <ItemsList
        items={form.items.filter((item) => item.type === "hourly")}
        objects={objects}
        onBreakChange={handleHourlyBreakChange}
        onStartTimeChange={handleHourlyStartTimeChange}
        onEndTimeChange={handleHourlyEndTimeChange}
        onRemove={(index) => {
          const hourlyItem = form.items.filter(
            (item) => item.type === "hourly",
          )[index];
          if (hourlyItem) {
            handleRemoveItem(hourlyItem.id, "hourly");
          }
        }}
        errors={errors}
        originalIndices={form.items
          .map((_, index) => index)
          .filter((index) => form.items[index].type === "hourly")}
      />{" "}
    </Section>
  );
}
