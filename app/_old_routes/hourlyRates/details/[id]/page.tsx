import FormDetailsHourlyRate from "@/app/components/formDetailsHourlyRate";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default async function DetailHourlyRate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idObjet = parseInt(id, 10);

  return (
    <>
      <Header />
      <FormDetailsHourlyRate idObjet={idObjet} />
      <Footer />
    </>
  );
}
