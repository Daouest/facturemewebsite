import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un Client - FactureMe | Create Client - FactureMe",
  description: "Ajoutez un nouveau client à votre catalogue. Enregistrez les coordonnées et informations de facturation de vos clients. | Add a new client to your catalogue. Save contact details and billing information for your clients.",
  keywords: ["créer client", "nouveau client", "gestion clients", "create client", "new client", "client management", "FactureMe"],
};

export default function CreateClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
