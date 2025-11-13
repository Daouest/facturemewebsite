import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function AppRootPage({ params }: Props) {
  const { lang } = await params;
  // Redirect [lang]/(app) root to dashboard
  redirect(`/${lang}/dashboard`);
}
