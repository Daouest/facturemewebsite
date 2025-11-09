import FormDetailItem from "@/app/components/formDetailItem";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
export default async function DetailItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idObjet = parseInt(id, 10);

  return (
    <>
      <Header />
      <FormDetailItem idObjet={idObjet} />
      <Footer />
    </>
  );
}
