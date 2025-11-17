import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebarWrapper from "@/app/components/MobileSidebarWrapper";

type Props = {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  if (lang === "fr") {
    return {
      title: "FactureMe - Tableau de bord",
      description: "Gérez vos factures, clients et produits",
    };
  }

  return {
    title: "FactureMe - Dashboard",
    description: "Manage your invoices, clients and products",
  };
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }];
}

export default async function AppLayout({ children, params }: Props) {
  const { lang } = await params;

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-slate-900">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />

        {/* Mobile Sidebar */}
        <MobileSidebarWrapper>
          <Sidebar />
        </MobileSidebarWrapper>

        <main className="flex-1 p-6 bg-gradient-to-br from-blue-900 to-indigo-950">
          {children}
        </main>
      </div>
    </div>
  );
}
