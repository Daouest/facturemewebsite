"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Form from "@/app/ui/invoices/InvoiceCreationForm";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebarWrapper from "@/app/components/MobileSidebarWrapper";
import { useUser } from "@/app/context/UserContext";
import type {
  CustomerField,
  BusinessField,
  ItemFieldWithPrice,
} from "@/app/lib/definitions";

export default function Page() {
  const router = useRouter();
  const { user, ready } = useUser();
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
        const [customersRes, businessesRes, productsRes, hourlyRatesRes] =
          await Promise.all([
            fetch("/api/clients-catalogue", { credentials: "include" }),
            fetch("/api/profile/business", { credentials: "include" }),
            fetch("/api/item-catalogue", { credentials: "include" }),
            fetch("/api/hourlyRates", { credentials: "include" }),
          ]);

        const customersData = await customersRes.json();
        const businessesData = await businessesRes.json();
        const productsData = await productsRes.json();
        const hourlyRatesData = await hourlyRatesRes.json();

        const transformedCustomers = (customersData.clients || []).map(
          (client: any) => ({
            id: client.idClient,
            name: client.nomClient,
          })
        );

        // Transform business data - API returns single object, not array
        const transformedBusinesses = businessesData.idBusiness
          ? [
              {
                id: businessesData.idBusiness,
                name: businessesData.name,
                businessNumber: businessesData.businessNumber,
                address: businessesData.address,
                city: businessesData.city,
                zipCode: businessesData.zipCode,
                province: businessesData.province,
                country: businessesData.country,
                logo: businessesData.logo,
                TVP: businessesData.TVP,
                TVQ: businessesData.TVQ,
                TVH: businessesData.TVH,
                TVS: businessesData.TVS,
              },
            ]
          : [];

        // Transform products
        const transformedProducts = (productsData || []).map((item: any) => ({
          id: item.idObjet,
          name: item.productName || "Unknown Product",
          type: "product" as const,
          price: item.price || 0,
          photo: item.productPhoto || null,
        }));

        // Transform hourly rates
        const transformedHourlyRates = (hourlyRatesData || []).map(
          (rate: any) => ({
            id: rate.idObjet,
            name: rate.workPosition || "Unknown Position",
            type: "hourly" as const,
            hourlyRate: rate.hourlyRate || 0,
          })
        );

        // Combine both arrays
        const allObjects = [...transformedProducts, ...transformedHourlyRates];

        setCustomers(transformedCustomers);
        setBusinesses(transformedBusinesses);
        setObjects(allObjects);
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
            {/* Sidebar */}
            <MobileSidebarWrapper>
              <Sidebar />
            </MobileSidebarWrapper>

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
