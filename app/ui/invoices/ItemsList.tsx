"use client";

import { ItemFieldWithPrice, InvoiceFormItem } from "@/app/lib/definitions";
import { createItemKey, calculateWorkedHours } from "@/app/lib/utils";
import ImageFromBd from "@/components/ui/images";

// Currency formatter
const fmt = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 2,
});

// Format price with "lots!" for values over 1,000,000
const formatPrice = (amount: number): string => {
  if (amount > 1000000) {
    return "lots!";
  }
  return fmt.format(amount);
};

export default function ItemsList({
  items,
  objects,
  onQuantityChange,
  onBreakChange,
  onStartTimeChange,
  onEndTimeChange,
  onRemove,
  errors = {},
  originalIndices = [],
}: {
  items: InvoiceFormItem[];
  objects: ItemFieldWithPrice[];
  onQuantityChange?: (index: number, quantity: number) => void;
  onBreakChange?: (index: number, breakTime: number) => void;
  onStartTimeChange?: (index: number, startTime: string) => void;
  onEndTimeChange?: (index: number, endTime: string) => void;
  onRemove: (index: number) => void;
  errors?: any;
  originalIndices?: number[];
}) {
  const handleIncrement = (
    index: number,
    currentValue: number,
    onChange: (index: number, value: number) => void
  ) => onChange(index, currentValue + 1);

  const handleDecrement = (
    index: number,
    currentValue: number,
    onChange: (index: number, value: number) => void,
    min = 0
  ) => currentValue > min && onChange(index, currentValue - 1);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const obj = objects.find((o) => o.id === item.id);
        const originalIndex = originalIndices[idx] ?? idx;
        const itemErrors = errors?.items?.[originalIndex];
        const uniqueKey = `${createItemKey(
          item.id,
          item.type
        )}-${originalIndex}`;

        if (!obj) {
          return (
            <div
              key={`missing-${idx}`}
              className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-4 shadow-sm"
            >
              <div className="flex items-center justify-center gap-3 text-rose-300">
                <div className="flex-shrink-0 w-8 h-8 bg-rose-500/15 rounded-full flex items-center justify-center ring-1 ring-rose-400/30">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Objet introuvable</h3>
                  <p className="text-xs text-rose-300/80">
                    L&apos;élément sélectionné n&apos;existe plus
                  </p>
                </div>
              </div>
            </div>
          );
        }

        // ---------- Type-safe pricing ----------
        const unitPrice = obj.type === "product" ? obj.price : obj.hourlyRate;

        const productTotal =
          item.type === "product"
            ? Number(unitPrice) * (item.quantity ?? 0)
            : 0;

        return (
          <div
            key={uniqueKey}
            className={[
              "rounded-xl overflow-hidden transition-all duration-200",
              "border bg-white/5 backdrop-blur shadow-[0_8px_24px_-20px_rgba(0,0,0,0.6)]",
              itemErrors
                ? "border-rose-400/30 ring-1 ring-rose-400/20"
                : "border-white/10",
            ].join(" ")}
          >
            {/* Header */}
            <div
              className={[
                "px-4 py-3 border-b",
                itemErrors
                  ? "bg-rose-500/10 border-rose-400/20"
                  : "bg-white/5 border-white/10",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.type === "product" ? (
                    <div>
                      <h3 className="font-semibold text-slate-100 flex items-center gap-3">
                        <span>{obj.name}</span>
                        <span className="flex-shrink-0">
                          {obj.photo ? (
                            <img
                              src={obj.photo}
                              alt={`Image ${obj.name}`}
                              width={40}
                              height={40}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: "cover",
                              }}
                              className="rounded-md"
                            />
                          ) : (
                            <ImageFromBd
                              id={obj.id}
                              name={`thumb-${obj.id}`}
                              size={40}
                            />
                          )}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300/70">📦 Produit</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-indigo-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-100">
                          {obj.name}
                        </h3>
                        <p className="text-xs text-slate-300/70">
                          ⏱️ Taux horaire
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Show line total in header for product */}
                {item.type === "product" && (
                  <div className="text-right">
                    <div className="text-xs text-slate-300/70">Total</div>
                    <div className="text-sm font-semibold text-slate-100">
                      {formatPrice(productTotal)}
                    </div>
                  </div>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => onRemove(originalIndex)}
                  className="flex-shrink-0 p-2 rounded-md text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors"
                  title={`Supprimer ${obj.name}`}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              {item.type === "product" ? (
                // ===== PRODUCT =====
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quantity controls */}
                  <div className="max-w-xs">
                    <label className="block text-xs font-semibold text-slate-200 mb-2">
                      Quantité requise
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className={[
                          "flex items-center rounded-lg overflow-hidden bg-white/5 border",
                          itemErrors?.quantity
                            ? "border-rose-400/40"
                            : "border-white/10",
                        ].join(" ")}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onQuantityChange &&
                            handleDecrement(
                              originalIndex,
                              item.quantity,
                              onQuantityChange,
                              1
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Diminuer la quantité"
                        >
                          <svg
                            className="h-3 w-3 text-slate-200"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 12h14"
                            />
                          </svg>
                        </button>

                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            onQuantityChange &&
                            onQuantityChange(
                              originalIndex,
                              Math.max(1, Number(e.target.value))
                            )
                          }
                          className={[
                            "w-16 text-center bg-transparent border-0 py-2 text-sm font-semibold outline-none",
                            itemErrors?.quantity
                              ? "text-rose-300"
                              : "text-slate-100",
                          ].join(" ")}
                          aria-invalid={!!itemErrors?.quantity}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            onQuantityChange &&
                            handleIncrement(
                              originalIndex,
                              item.quantity,
                              onQuantityChange
                            )
                          }
                          className="p-2 hover:bg-white/10 transition-colors"
                          aria-label="Augmenter la quantité"
                        >
                          <svg
                            className="h-3 w-3 text-slate-200"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </button>
                      </div>

                      <span className="text-sky-300/90 text-xs font-semibold bg-sky-500/10 ring-1 ring-sky-400/30 px-2 py-1 rounded">
                        pièces
                      </span>
                    </div>

                    {itemErrors?.quantity && (
                      <div className="mt-2 space-y-1">
                        {itemErrors.quantity.map((error: string, i: number) => (
                          <p
                            key={i}
                            className="text-xs text-rose-300 flex items-center gap-1"
                          >
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                              />
                            </svg>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing box */}
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-slate-300/70">Prix unitaire</div>
                        <div className="font-medium text-slate-100">
                          {formatPrice(Number(unitPrice) || 0)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-300/70">Quantité</div>
                        <div className="font-medium text-slate-100">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-300/70">Total ligne</div>
                        <div className="font-semibold text-slate-100">
                          {formatPrice(productTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // ===== HOURLY ===== (unchanged visuals)
                <div className="space-y-4">
                  <div className="rounded-lg p-3 border border-white/10 bg-white/5">
                    <h4 className="text-xs font-semibold text-slate-200 mb-3">
                      Période de travail
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Début
                        </label>
                        <input
                          type="datetime-local"
                          value={item.startTime || ""}
                          onChange={(e) =>
                            onStartTimeChange?.(originalIndex, e.target.value)
                          }
                          className={[
                            "w-full rounded-md bg-white/5 text-slate-100 placeholder:text-slate-400",
                            "border py-2 px-3 text-xs outline-none focus:ring-1",
                            itemErrors?.startTime
                              ? "border-rose-400/40 focus:border-rose-400/60 focus:ring-rose-400/20"
                              : "border-white/10 focus:border-sky-400/60 focus:ring-sky-400/20",
                          ].join(" ")}
                          aria-invalid={!!itemErrors?.startTime}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Fin
                        </label>
                        <input
                          type="datetime-local"
                          value={item.endTime || ""}
                          onChange={(e) =>
                            onEndTimeChange?.(originalIndex, e.target.value)
                          }
                          className={[
                            "w-full rounded-md bg-white/5 text-slate-100 placeholder:text-slate-400",
                            "border py-2 px-3 text-xs outline-none focus:ring-1",
                            itemErrors?.endTime
                              ? "border-rose-400/40 focus:border-rose-400/60 focus:ring-rose-400/20"
                              : "border-white/10 focus:border-sky-400/60 focus:ring-sky-400/20",
                          ].join(" ")}
                          aria-invalid={!!itemErrors?.endTime}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg p-3 border border-white/10 bg-white/5">
                      <label className="block text-xs font-semibold text-slate-200 mb-2">
                        Pause
                      </label>
                      <div className="flex items-center gap-2">
                        <div
                          className={[
                            "flex items-center rounded-md overflow-hidden bg-white/5 border",
                            itemErrors?.breakTime
                              ? "border-rose-400/40"
                              : "border-white/10",
                          ].join(" ")}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              onBreakChange &&
                              handleDecrement(
                                originalIndex,
                                item.breakTime,
                                onBreakChange,
                                0
                              )
                            }
                            disabled={item.breakTime <= 0}
                            className="p-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg
                              className="h-3 w-3 text-slate-200"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 12h14"
                              />
                            </svg>
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={item.breakTime}
                            onChange={(e) =>
                              onBreakChange?.(
                                originalIndex,
                                Math.max(0, Number(e.target.value))
                              )
                            }
                            className={[
                              "w-12 text-center bg-transparent border-0 py-2 text-xs font-semibold outline-none",
                              itemErrors?.breakTime
                                ? "text-rose-300"
                                : "text-slate-100",
                            ].join(" ")}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onBreakChange &&
                              handleIncrement(
                                originalIndex,
                                item.breakTime,
                                onBreakChange
                              )
                            }
                            className="p-2 hover:bg-white/10 transition-colors"
                          >
                            <svg
                              className="h-3 w-3 text-slate-200"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                              />
                            </svg>
                          </button>
                        </div>
                        <span className="text-amber-300/90 text-xs font-semibold">
                          min
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg p-3 border border-white/10 bg-white/5 text-center">
                      <label className="block text-xs font-semibold text-slate-200 mb-2">
                        Total
                      </label>
                      <span className="text-lg font-bold text-sky-200">
                        {item.startTime && item.endTime
                          ? calculateWorkedHours(
                              item.startTime,
                              item.endTime,
                              item.breakTime
                            ).toFixed(2)
                          : "0.00"}
                      </span>
                      <div className="text-xs font-semibold text-sky-300/90">
                        heures
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
