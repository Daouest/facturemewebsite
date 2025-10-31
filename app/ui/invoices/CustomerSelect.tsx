import { CustomerField } from '@/app/lib/definitions';

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
    return (
        <div className="bg-blue-50 rounded-xl p-4">
            <label htmlFor="customer" className="mb-3 block text-sm font-semibold text-gray-800">
                👤 Choisir un client
            </label>
            <div className="relative">
                <select
                    id="customer"
                    name="customerId"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-10 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white appearance-none"
                >
                    <option value="" disabled>
                        Sélectionner un client
                    </option>
                    {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                            {customer.name}
                        </option>
                    ))}
                </select>
                <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
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