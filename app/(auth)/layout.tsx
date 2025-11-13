import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FactureMe - Authentication",
  description: "Login or sign up to FactureMe",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth layout - no sidebar, minimal UI
  return children;
}
