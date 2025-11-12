import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil - FactureMe | Profile - FactureMe",
  description: "Gérez votre profil et les informations de votre entreprise. Mettez à jour vos coordonnées, logo et paramètres de facturation. | Manage your profile and company information. Update your contact details, logo and billing settings.",
  keywords: ["profil", "compte", "entreprise", "paramètres", "profile", "account", "company", "settings", "FactureMe"],
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
