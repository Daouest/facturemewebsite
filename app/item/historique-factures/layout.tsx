import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historique des Factures - FactureMe | Invoice History - FactureMe",
  description: "Consultez l'historique complet des factures liées à vos articles. Suivez l'utilisation et la facturation de vos produits. | View complete invoice history linked to your items. Track usage and billing of your products.",
  keywords: ["historique", "factures", "articles", "suivi", "history", "invoices", "items", "tracking", "FactureMe"],
};

export default function HistoriqueFacturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
