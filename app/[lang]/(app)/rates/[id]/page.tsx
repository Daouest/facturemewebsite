import FormDetailsHourlyRate from "@/app/components/formDetailsHourlyRate";

export default async function RateDetailPage({
  params,
}: {
  params: Promise<{ id: string; lang: string }>;
}) {
  const { id, lang } = await params;
  const idObjet = parseInt(id, 10);

  return (
    <div className="px-6 py-8">
      <FormDetailsHourlyRate idObjet={idObjet} />
    </div>
  );
}
