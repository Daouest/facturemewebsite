import type { Metadata } from "next";

type Props = {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  
  if (lang === "fr") {
    return {
      title: "FactureMe - Gestion de Factures",
      description: "Gestion des factures professionnelle et simplifiée.",
    };
  }
  
  return {
    title: "FactureMe - Invoice Management",
    description: "Professional and simplified invoice management.",
  };
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }];
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  
  // Just pass through - contexts are handled by root layout
  // This layout exists to capture the [lang] param
  return <>{children}</>;
}
