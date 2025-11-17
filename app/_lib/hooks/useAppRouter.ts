import { useRouter, useParams } from "next/navigation";
/** * Custom hook that combines router and language params * Eliminates repeated pattern of extracting lang from params *  * @example * const { router, lang, params } = useAppRouter(); * router.push(`/${lang}/profile`); */ export function useAppRouter() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "fr";
  return { router, params, lang };
}
