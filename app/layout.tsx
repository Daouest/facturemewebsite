import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FormDataProvider } from "@/app/context/FormContext";
import { AppUser, UserProvider } from "@/app/context/UserContext";
import { LangageProvider } from "@/app/context/langageContext";
import { getUserFromCookies } from "./lib/session/session-node";
import ReactQueryWrapper from "@/app/context/ReactQueryWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  description: "Gestion des factures",
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
      }
    : undefined;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950`}
      >
        <UserProvider initialUser={user}>
          <LangageProvider>
            <FormDataProvider>
              <ReactQueryWrapper>{children}</ReactQueryWrapper>
            </FormDataProvider>
          </LangageProvider>
        </UserProvider>
      </body>
    </html>
  );

  /*
ReactQueryDevtoolsPanel:
This will add a floating Devtools panel to your app, allowing you to inspect queries, cache states, and more.

Debugging Features

The Devtools provide a visual interface to:

Monitor active queries and their states (e.g., fetching, error, success).

View cached data and query keys.

Retry or refetch queries manually.

Identify stale or inactive queries.
*/
}
