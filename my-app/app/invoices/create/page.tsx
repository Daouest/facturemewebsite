import Form from '@/app/ui/invoices/create-form';
import { fetchCustomers, fetchBusinesses, fetchObjectsAndRates } from '@/app/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Création de facture',
};

export default async function Page() {
    const [customers, businesses, objects] = await Promise.all([
        fetchCustomers(),
        fetchBusinesses(),
        fetchObjectsAndRates(),
    ]);

    console.log(customers);

    return (
        <main>
            <Form customers={customers} businesses={businesses} objects={objects} />
        </main>
    );
}