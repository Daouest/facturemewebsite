import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles Archivés - FactureMe | Archived Items - FactureMe",
  description: "Consultez vos articles et services archivés. Gardez une trace de tous vos produits historiques. | View your archived items and services. Keep track of all your historical products.",
  keywords: ["archives", "articles", "historique", "archived", "items", "history", "FactureMe"],
};

export default function ItemsArchivesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
