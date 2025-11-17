import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer une Facture - FactureMe | Create Invoice - FactureMe",
  description:
    "Créez une nouvelle facture professionnelle. Ajoutez vos articles, services et calculez automatiquement les totaux. | Create a new professional invoice. Add your items, services and automatically calculate totals.",
  keywords: [
    "créer facture",
    "nouvelle facture",
    "facturation",
    "create invoice",
    "new invoice",
    "billing",
    "FactureMe",
  ],
};

export default function CreateInvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
