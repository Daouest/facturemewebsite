import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un Taux Horaire - FactureMe | Create Hourly Rate - FactureMe",
  description: "Définissez un nouveau taux horaire pour vos services. Personnalisez vos tarifs par client et type de prestation. | Define a new hourly rate for your services. Customize your rates by client and type of service.",
  keywords: ["créer taux", "tarification", "taux horaire", "create rate", "pricing", "hourly rate", "FactureMe"],
};

export default function CreateHourlyRateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
