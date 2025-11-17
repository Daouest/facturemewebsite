import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vérifiez votre Email - FactureMe | Check Your Email - FactureMe",
  description:
    "Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception pour activer votre compte. | A confirmation email has been sent to you. Please check your inbox to activate your account.",
  keywords: [
    "vérification",
    "email",
    "confirmation",
    "verification",
    "FactureMe",
  ],
};

export default function CheckEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
