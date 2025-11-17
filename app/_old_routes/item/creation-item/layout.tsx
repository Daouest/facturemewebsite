import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un Article - FactureMe | Create Item - FactureMe",
  description:
    "Créez un nouvel article ou service dans votre catalogue. Ajoutez des descriptions, tarifs et détails personnalisés. | Create a new item or service in your catalogue. Add descriptions, prices and custom details.",
  keywords: [
    "création",
    "nouvel article",
    "produit",
    "service",
    "create",
    "new item",
    "product",
    "FactureMe",
  ],
};

export default function CreationItemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
