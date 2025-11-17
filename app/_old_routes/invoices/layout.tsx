import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Factures - FactureMe | Invoices - FactureMe",
  description:
    "Gérez toutes vos factures en un seul endroit. Créez, modifiez et envoyez vos factures professionnelles facilement. | Manage all your invoices in one place. Create, edit and send your professional invoices easily.",
  keywords: [
    "factures",
    "facturation",
    "gestion",
    "invoices",
    "billing",
    "management",
    "FactureMe",
  ],
};

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
