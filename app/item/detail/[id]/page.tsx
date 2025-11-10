import FormDetailItem from "@/app/components/formDetailItem";

export default async function DetailItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idObjet = parseInt(id, 10);

  return (
    <>
      <FormDetailItem idObjet={idObjet} />
    </>
  );
}
