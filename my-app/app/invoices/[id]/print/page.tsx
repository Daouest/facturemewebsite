import { notFound } from "next/navigation";
import PDFInvoice from "@/app/ui/invoices/pdf-invoice";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const factureId = parseInt(params.id, 10);

    // Validate the invoice ID
    if (isNaN(factureId)) {
        notFound();
    }

    // Render the PDF invoice component with the API data
    return (
        <main>
            <PDFInvoice invoiceId={factureId} />
        </main>
    );
}