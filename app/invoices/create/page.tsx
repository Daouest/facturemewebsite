"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Form from "@/app/ui/invoices/create-form";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import { Menu, X } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import type {
  CustomerField,
  BusinessField,
  ItemFieldWithPrice,
} from "@/app/lib/definitions";

export default function Page() {
  const router = useRouter();
  const { user, ready } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerField[]>([]);
  const [businesses, setBusinesses] = useState<BusinessField[]>([]);
  const [objects, setObjects] = useState<ItemFieldWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (ready && !user) {
      router.push("/auth/signup");
    }
  }, [user, ready, router]);

  useEffect(() => {
    // Don't fetch data if not authenticated
    if (!ready || !user) {
      return;
    }

    const fetchData = async () => {
      try {
        const [customersRes, businessesRes, objectsRes] = await Promise.all([
          fetch("/api/clients-catalogue", { credentials: "include" }),
          fetch("/api/profile", { credentials: "include" }),
          fetch("/api/item-catalogue", { credentials: "include" }),
        ]);

        const customersData = await customersRes.json();
        const businessesData = await businessesRes.json();
        const objectsData = await objectsRes.json();

        const transformedCustomers = (customersData.clients || []).map(
          (client: any) => ({
            id: client.idClient,
            name: client.nomClient,
          })
        );

        setCustomers(transformedCustomers);
        setBusinesses(businessesData.businesses || []);
        setObjects(objectsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, ready]);

  // Show loading while checking authentication or fetching data
  if (!ready || loading || !user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
          <div className="text-slate-300">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        <main className="flex-1 pt-20">
          <div className="max-w-7xl mx-auto px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg hover:bg-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/50"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Mobile backdrop */}
            {isSidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside
              className={`fixed lg:relative top-20 lg:top-0 left-0 h-[calc(100vh-5rem)] lg:h-auto w-64 lg:w-auto transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              } z-50 lg:z-auto lg:flex-shrink-0`}
            >
              <Sidebar />
            </aside>

            {/* Main Content */}
            <section className="flex-1">
              <Form
                customers={customers}
                businesses={businesses}
                objects={objects}
              />
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
