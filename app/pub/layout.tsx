import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "FactureMe - Logiciel de Facturation en Ligne | Online Invoicing Software",
  description:
    "FactureMe - Solution professionnelle de facturation en ligne. Créez et gérez vos factures facilement. Essai gratuit. | FactureMe - Professional online invoicing solution. Create and manage your invoices easily. Free trial.",
  keywords: [
    "facturation",
    "logiciel",
    "factures",
    "gestion",
    "invoicing",
    "software",
    "invoices",
    "management",
    "FactureMe",
  ],
};

export default function PubLayout({ children }: { children: React.ReactNode }) {
  return children;
}
