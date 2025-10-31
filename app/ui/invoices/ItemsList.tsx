'use client'

import { ItemField, InvoiceFormItem } from '@/app/lib/definitions';
import { createItemKey } from "@/app/lib/utils";
import { calculateWorkedHours } from '@/app/lib/utils';

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
    objects: ItemField[];
    onQuantityChange?: (index: number, quantity: number) => void;
    onBreakChange?: (index: number, breakTime: number) => void;
    onStartTimeChange?: (index: number, startTime: string) => void;
    onEndTimeChange?: (index: number, endTime: string) => void;
    onRemove: (index: number) => void;
    errors?: any;
    originalIndices?: number[];
}) {
    const handleIncrement = (index: number, currentValue: number, onChange: (index: number, value: number) => void) => {
        onChange(index, currentValue + 1);
    };

    const handleDecrement = (index: number, currentValue: number, onChange: (index: number, value: number) => void, min = 0) => {
        if (currentValue > min) {
            onChange(index, currentValue - 1);
        }
    };

    return (
        <>
            {items.length > 0 && (
                <div className="space-y-2">
                    {items.map((item, idx) => {
                        const obj = objects.find((o) => o.id === item.id);
                        const originalIndex = originalIndices[idx] || idx;
                        const itemErrors = errors?.items?.[originalIndex];
                        const uniqueKey = createItemKey(item.id, item.type);
                        
                        if (!obj) {
                            return (
                                <div key={`${item.id}-${item.type}-${idx}`} className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-center gap-3 text-red-600">
                                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">Objet introuvable</h3>
                                            <p className="text-xs text-red-500">L'élément sélectionné n'existe plus</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={uniqueKey} className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${itemErrors ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'}`}>
                                {/* Compact Header */}
                                <div className={`bg-gradient-to-r px-4 py-3 border-b ${itemErrors ? 'from-red-50 to-red-100 border-red-200' : 'from-blue-50 to-indigo-50 border-gray-100'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-shrink-0 w-8 h-8 bg-white rounded-md shadow-sm flex items-center justify-center">
                                                {item.type === 'product' ? (
                                                    <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{obj.name}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {item.type === 'product' ? '📦 Produit' : '⏱️ Taux horaire'}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            onClick={() => onRemove(originalIndex)}
                                            className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200 group"
                                            title={`Supprimer ${obj.name}`}
                                        >
                                            <svg className="h-4 w-4 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Compact Content */}
                                <div className="p-4">
                                    {item.type === 'product' ? (
                                        /* Compact Product Controls */
                                        <div className="max-w-xs">
                                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <svg className="h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                                                        </svg>
                                                    </div>
                                                    Quantité requise
                                                </div>
                                            </label>
                                            {/* Product quantity controls */}
                                            <div className="flex items-center gap-2">
                                                <div className={`flex items-center bg-gray-50 rounded-lg border overflow-hidden ${itemErrors?.quantity ? 'border-red-300' : 'border-gray-200'}`}>
                                                    <button
                                                        type="button"
                                                        onClick={() => onQuantityChange && handleDecrement(originalIndex, item.quantity, onQuantityChange, 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                                        </svg>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={e => onQuantityChange && onQuantityChange(originalIndex, Math.max(1, Number(e.target.value)))}
                                                        className={`w-16 text-center bg-white border-0 py-2 text-sm font-semibold outline-none ${itemErrors?.quantity ? 'text-red-600' : ''}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => onQuantityChange && handleIncrement(originalIndex, item.quantity, onQuantityChange)}
                                                        className="p-2 hover:bg-gray-200 transition-colors"
                                                    >
                                                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <span className="text-blue-600 text-xs font-semibold bg-blue-50 px-2 py-1 rounded">pièces</span>
                                            </div>
                                            {/* Product quantity error */}
                                            {itemErrors?.quantity && (
                                                <div className="mt-2">
                                                    {itemErrors.quantity.map((error: string, errorIdx: number) => (
                                                        <p key={errorIdx} className="text-xs text-red-600 flex items-center gap-1">
                                                            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                                            </svg>
                                                            {error}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Compact Hourly Controls */
                                        <div className="space-y-4">
                                            {/* Time Period Section */}
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <svg className="h-3 w-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                                        </svg>
                                                    </div>
                                                    Période de travail
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            <div className="flex items-center gap-1">
                                                                <svg className="h-3 w-3 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                </svg>
                                                                Début
                                                            </div>
                                                        </label>
                                                        {/* Start time input */}
                                                        <input
                                                            type="datetime-local"
                                                            value={item.startTime || ''}
                                                            onChange={e => onStartTimeChange?.(originalIndex, e.target.value)}
                                                            className={`w-full bg-white rounded-md border py-2 px-3 text-xs outline-none focus:ring-1 ${itemErrors?.startTime ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'}`}
                                                        />
                                                        {/* Start time error */}
                                                        {itemErrors?.startTime && (
                                                            <div className="mt-1">
                                                                {itemErrors.startTime.map((error: string, errorIdx: number) => (
                                                                    <p key={errorIdx} className="text-xs text-red-600 flex items-center gap-1">
                                                                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                                                        </svg>
                                                                        {error}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            <div className="flex items-center gap-1">
                                                                <svg className="h-3 w-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                </svg>
                                                                Fin
                                                            </div>
                                                        </label>
                                                        {/* End time input */}
                                                        <input
                                                            type="datetime-local"
                                                            value={item.endTime || ''}
                                                            onChange={e => onEndTimeChange?.(originalIndex, e.target.value)}
                                                            className={`w-full bg-white rounded-md border py-2 px-3 text-xs outline-none focus:ring-1 ${itemErrors?.endTime ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'}`}
                                                        />
                                                        {/* End time error */}
                                                        {itemErrors?.endTime && (
                                                            <div className="mt-1">
                                                                {itemErrors.endTime.map((error: string, errorIdx: number) => (
                                                                    <p key={errorIdx} className="text-xs text-red-600 flex items-center gap-1">
                                                                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                                                        </svg>
                                                                        {error}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Break and Summary Section */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {/* Break Time */}
                                                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                                                                <svg className="h-3 w-3 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3.001 2.48Z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                                                                </svg>
                                                            </div>
                                                            Pause
                                                        </div>
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        {/* Hourly rate controls - same fix needed */}
                                                        <div className={`flex items-center bg-white rounded-md border overflow-hidden ${itemErrors?.breakTime ? 'border-red-300' : 'border-amber-200'}`}>
                                                            <button
                                                                type="button"
                                                                onClick={() => onBreakChange && handleDecrement(originalIndex, item.breakTime, onBreakChange, 0)}
                                                                disabled={item.breakTime <= 0}
                                                                className="p-2 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                                                </svg>
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                value={item.breakTime}
                                                                onChange={e => onBreakChange?.(originalIndex, Math.max(0, Number(e.target.value)))}
                                                                className={`w-12 text-center bg-white border-0 py-2 text-xs font-semibold outline-none ${itemErrors?.breakTime ? 'text-red-600' : ''}`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => onBreakChange && handleIncrement(originalIndex, item.breakTime, onBreakChange)}
                                                                className="p-2 hover:bg-amber-50 transition-colors"
                                                            >
                                                                <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <span className="text-amber-700 text-xs font-semibold">min</span>
                                                    </div>
                                                    {/* Break time error */}
                                                    {itemErrors?.breakTime && (
                                                        <div className="mt-2">
                                                            {itemErrors.breakTime.map((error: string, errorIdx: number) => (
                                                                <p key={errorIdx} className="text-xs text-red-600 flex items-center gap-1">
                                                                    <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                                                    </svg>
                                                                    {error}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Calculated Hours */}
                                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <svg className="h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                                                                </svg>
                                                            </div>
                                                            Total
                                                        </div>
                                                    </label>
                                                    <div className="bg-white rounded-md border border-blue-200 py-2 px-3 text-center">
                                                        <span className="text-lg font-bold text-blue-700">
                                                            {item.startTime && item.endTime 
                                                                ? calculateWorkedHours(item.startTime, item.endTime, item.breakTime).toFixed(2)
                                                                : '0.00'
                                                            }
                                                        </span>
                                                        <div className="text-xs font-semibold text-blue-600">heures</div>
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
            )}
        </>
    );
}