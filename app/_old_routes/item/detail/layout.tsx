import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Détail de l'Article - FactureMe | Item Details - FactureMe",
  description: "Consultez et modifiez les détails d'un article. Mettez à jour les informations, tarifs et descriptions de vos produits et services. | View and edit item details. Update information, prices and descriptions of your products and services.",
  keywords: ["détail", "article", "modification", "édition", "details", "item", "edit", "FactureMe"],
};

export default function ItemDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
