import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prévisualisation - FactureMe | Preview - FactureMe",
  description: "Prévisualisez votre facture avant l'envoi. Vérifiez tous les détails et le rendu final de votre document. | Preview your invoice before sending. Check all details and final rendering of your document.",
  keywords: ["prévisualisation", "facture", "aperçu", "preview", "invoice", "FactureMe"],
};

export default function PrevisualisationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
