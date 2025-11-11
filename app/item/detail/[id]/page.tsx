import FormDetailItem from "@/app/components/formDetailItem";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebarWrapper from "@/app/components/MobileSidebarWrapper";

export default async function DetailItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("id encoder", id);
  let idObjet: number | null = null;
  try {
    // Étape 1 : décoder les caractères d'URL (%3D -> =)
    const urlDecoded = decodeURIComponent(id);
    // Étape 2 : décoder la base64 ("MTQ=" -> "14")
    const decoded = atob(urlDecoded);

    // Étape 3: convertion en nombre
    idObjet = parseInt(decoded, 10);
  } catch (err) {
    console.error("Erreur dans le decode de l'id", err);
  }

  return (
    <>
      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />

        <main className="flex-1 pt-[80px]">
          <div className="w-full max-w-7xl mx-auto px-6 pb-10 flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Sidebar */}
            <MobileSidebarWrapper>
              <Sidebar />
            </MobileSidebarWrapper>

            {/* Main Content */}
            <section className="flex-1">
              <FormDetailItem idObjet={idObjet ?? 0} />
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
