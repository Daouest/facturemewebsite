import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration - FactureMe | Administration - FactureMe",
  description:
    "Panneau d'administration FactureMe. Gérez les utilisateurs, paramètres système et statistiques globales. | FactureMe administration panel. Manage users, system settings and global statistics.",
  keywords: [
    "admin",
    "administration",
    "gestion",
    "système",
    "management",
    "system",
    "FactureMe",
  ],
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
