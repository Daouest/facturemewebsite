import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue d'Articles - FactureMe | Item Catalogue - FactureMe",
  description:
    "Parcourez votre catalogue d'articles et services. Gérez facilement vos produits pour une facturation rapide et efficace. | Browse your catalogue of items and services. Easily manage your products for fast and efficient invoicing.",
  keywords: [
    "catalogue",
    "articles",
    "produits",
    "services",
    "items",
    "products",
    "FactureMe",
  ],
};

export default function ItemCatalogueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
