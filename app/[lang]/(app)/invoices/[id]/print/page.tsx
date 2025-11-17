"use client";

import { notFound, useParams } from "next/navigation";
import PDFInvoice from "@/app/_components/invoices/pdf-invoice";
import { useLangageContext } from "@/app/context/langageContext";
import { use } from "react";

export default function InvoicePrintPage(props: {
  params: Promise<{ id: string; lang: string }>;
}) {
  const params = use(props.params);
  const factureId = parseInt(params.id, 10);
  const lang = params.lang as "fr" | "en";
  const { langage } = useLangageContext();

  // Validate the invoice ID
  if (isNaN(factureId)) {
    notFound();
  }

  // Render the PDF invoice component with the API data
  return (
    <main>
      <PDFInvoice invoiceId={factureId} language={lang || langage} />
    </main>
  );
}
