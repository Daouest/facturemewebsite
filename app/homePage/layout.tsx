import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil - FactureMe | Home - FactureMe",
  description: "Tableau de bord FactureMe. Gérez vos factures, clients et taux horaires en toute simplicité. | FactureMe dashboard. Manage your invoices, clients and hourly rates with ease.",
  keywords: ["tableau de bord", "factures", "gestion", "dashboard", "invoices", "management", "FactureMe"],
};

export default function HomePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
