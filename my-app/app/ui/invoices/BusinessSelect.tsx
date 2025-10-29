import { BusinessField } from '@/app/lib/definitions';

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
    return (
        <div className="bg-blue-50 rounded-xl p-4">
            <label htmlFor="business" className="mb-3 block text-sm font-semibold text-gray-800">
                🏢 Choisir une entreprise
            </label>
            <div className="relative">
                <select
                    id="business"
                    name="businessId"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-10 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white appearance-none"
                >
                    <option value="" disabled>
                        Sélectionner une entreprise
                    </option>
                    {businesses.map((business) => (
                        <option key={business.id} value={business.id}>
                            {business.name}
                        </option>
                    ))}
                </select>
                <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m0-18C13.5 3 21 10.5 21 21M2.25 3h13.5C22.5 3 25.5 6 25.5 12.75V21" />
                </svg>
                <svg className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
            {error && (
                <div className="mt-2">
                    {error.map((err) => (
                        <p className="text-sm text-red-500" key={err}>
                            {err}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}