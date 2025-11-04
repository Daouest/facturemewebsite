import Form from "@/app/ui/invoices/create-form";
import {
  fetchCustomers,
  fetchBusinesses,
  fetchObjectsAndRates,
} from "@/app/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Création de facture",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

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
