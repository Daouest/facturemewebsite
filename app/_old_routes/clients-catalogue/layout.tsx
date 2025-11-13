import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue Clients - FactureMe | Client Catalogue - FactureMe",
  description: "Gérez vos clients efficacement. Consultez, ajoutez et modifiez les informations de vos clients pour une facturation simplifiée. | Manage your clients efficiently. View, add and edit your client information for simplified invoicing.",
  keywords: ["clients", "catalogue", "gestion clients", "client management", "facturation", "invoicing", "FactureMe"],
};

export default function ClientsCatalogueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
