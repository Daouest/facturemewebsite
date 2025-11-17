import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription - FactureMe | Sign Up - FactureMe",
  description:
    "Créez votre compte FactureMe et commencez à gérer vos factures professionnellement. Inscription gratuite et simple. | Create your FactureMe account and start managing your invoices professionally. Free and simple signup.",
  keywords: [
    "inscription",
    "créer un compte",
    "signup",
    "create account",
    "FactureMe",
  ],
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
