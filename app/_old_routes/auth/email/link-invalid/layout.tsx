import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lien Invalide - FactureMe | Invalid Link - FactureMe",
  description:
    "Le lien de vérification est invalide ou a expiré. Demandez un nouveau lien de confirmation. | The verification link is invalid or has expired. Request a new confirmation link.",
  keywords: [
    "lien invalide",
    "email",
    "vérification",
    "invalid link",
    "verification",
    "FactureMe",
  ],
};

export default function LinkInvalidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
