import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taux Horaires - FactureMe | Hourly Rates - FactureMe",
  description:
    "Gérez vos taux horaires par client et poste de travail. Simplifiez la facturation de vos services avec des taux personnalisés. | Manage your hourly rates by client and work position. Simplify your service billing with customized rates.",
  keywords: [
    "taux horaires",
    "hourly rates",
    "tarification",
    "pricing",
    "services",
    "FactureMe",
  ],
};

export default function HourlyRatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
