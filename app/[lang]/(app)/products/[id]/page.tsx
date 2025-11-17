import FormDetailItem from "@/app/components/formDetailItem";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; lang: string }>;
}) {
  const { id, lang } = await params;
  let idObjet: number | null = null;

  try {
    // Step 1: URL decode in case Next.js encoded the base64 string
    const urlDecoded = decodeURIComponent(id);

    // Step 2: Decode the base64 string
    const decoded = atob(urlDecoded);

    // Step 3: Convert to number
    idObjet = parseInt(decoded, 10);
  } catch (err) {
    console.error("Erreur dans le decode de l'id", err);
  }

  return (
    <div className="px-6 py-8">
      <FormDetailItem idObjet={idObjet ?? 0} />
    </div>
  );
}
