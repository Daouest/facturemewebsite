import { ItemFieldWithPrice, InvoiceForm } from "@/app/lib/definitions";
import ItemsList from "@/app/ui/invoices/ItemsList";
import { createTranslator } from "@/app/lib/utils";
import { useLangageContext } from "@/app/context/langageContext";

type Props = {
  productObjects: ItemFieldWithPrice[];
  form: InvoiceForm;
  selectedProduct: number;
  setSelectedProduct: (val: number) => void;
  handleAddItem: () => void;
  handleProductQuantityChange: (index: number, quantity: number) => void;
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

export default function ProductsSection({
  productObjects,
  form,
  selectedProduct,
  setSelectedProduct,
  handleAddItem,
  handleProductQuantityChange,
  handleRemoveItem,
  objects,
  errors,
}: Props) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  return (
    <section className="rounded-xl ring-1 ring-white/10 bg-white/0 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 ring-1 ring-amber-400/30">
          <span className="text-amber-300">📦</span>
        </span>
        <h2 className="text-sm font-semibold text-slate-200">
          {t("products")}
          <span aria-hidden="true" className="text-rose-300 ml-1">
            *
          </span>
        </h2>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <select
            value={selectedProduct === -1 ? "" : String(selectedProduct)}
            onChange={(e) =>
              setSelectedProduct(
                e.target.value === "" ? -1 : Number(e.target.value)
              )
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 text-slate-100 py-3 pl-12 pr-10 text-sm outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 appearance-none"
          >
            <option value="">{t("selectProduct")}</option>
            {productObjects
              .filter(
                (obj) =>
                  !form.items.some(
                    (item) => item.id === obj.id && item.type === "product"
                  )
              )
              .map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}
                </option>
              ))}
          </select>

          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
              d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
            />
          </svg>
          <svg
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="px-4 py-3 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          disabled={selectedProduct === -1}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {t("add")}
        </button>
      </div>

      <ItemsList
        items={form.items.filter((item) => item.type === "product")}
        objects={objects}
        onQuantityChange={handleProductQuantityChange}
        onRemove={(index) => {
          const productItem = form.items.filter(
            (item) => item.type === "product"
          )[index];
          if (productItem) {
            handleRemoveItem(productItem.id, "product");
          }
        }}
        errors={errors}
        originalIndices={form.items
          .map((_, index) => index)
          .filter((index) => form.items[index].type === "product")}
      />
    </section>
  );
}
