"use client";

import { notFound } from "next/navigation";
import PDFInvoice from "@/app/ui/invoices/pdf-invoice";
import { useLangageContext } from "@/app/context/langageContext";
import { use } from "react";

export default function Page(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const factureId = parseInt(params.id, 10);
    const { langage } = useLangageContext();

    // Validate the invoice ID
    if (isNaN(factureId)) {
        notFound();
    }

    // Render the PDF invoice component with the API data
    return (
        <main>
            <PDFInvoice invoiceId={factureId} language={langage} />
        </main>
    );
}