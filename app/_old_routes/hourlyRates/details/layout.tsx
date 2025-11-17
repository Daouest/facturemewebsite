import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Détails du Taux Horaire - FactureMe | Hourly Rate Details - FactureMe",
  description:
    "Consultez et modifiez les détails d'un taux horaire. Ajustez vos tarifs pour vos différents clients et services. | View and edit hourly rate details. Adjust your rates for different clients and services.",
  keywords: [
    "détails taux",
    "taux horaire",
    "tarification",
    "modification",
    "rate details",
    "hourly rate",
    "pricing",
    "edit",
    "FactureMe",
  ],
};

export default function HourlyRateDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
