import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FormDataProvider } from "@/app/context/FormContext";
import { HourlyFormDataProvider } from "@/app/context/HourlyRateFormContext";
import { AppUser, UserProvider } from "@/app/context/UserContext";
import { LangageProvider } from "@/app/context/langageContext";
import { getUserFromCookies } from "./_lib/session/session-node";
import ReactQueryWrapper from "@/app/context/ReactQueryWrapper";
import { SidebarProvider } from "@/app/context/SidebarContext";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FactureMe",
  description: "Invoice Management System",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  //on get le user du context/cookie
  const raw = await getUserFromCookies();

  const user: AppUser | undefined = raw
    ? {
        id: String(raw.idUser),
        username: raw.username,
        email: raw.email,
        firstName: raw.firstName,
        lastName: raw.lastName,
        isAdmin: raw.isAdmin ?? false,
      }
    : undefined;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider initialUser={user}>
          <LangageProvider>
            <SidebarProvider>
              <FormDataProvider>
                <HourlyFormDataProvider>
                  <ReactQueryWrapper>{children}</ReactQueryWrapper>
                </HourlyFormDataProvider>
              </FormDataProvider>
            </SidebarProvider>
          </LangageProvider>
        </UserProvider>
      </body>
    </html>
  );
}
