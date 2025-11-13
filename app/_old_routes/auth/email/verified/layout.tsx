import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Vérifié - FactureMe | Email Verified - FactureMe",
  description: "Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant accéder à votre compte FactureMe. | Your email address has been successfully verified. You can now access your FactureMe account.",
  keywords: ["vérification", "email", "compte", "verification", "account", "FactureMe"],
};

export default function EmailVerifiedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
