import { BusinessField } from "@/app/_lib/types/definitions";
import { createTranslator } from "@/app/_lib/utils/format";
import { useLangageContext } from "@/app/_context/langageContext";
import Select from "@/app/_components/shared/Select";

export default function BusinessSelect({
  businesses,
  value,
  onChange,
  error,
}: {
  businesses: BusinessField[];
  value: string;
  onChange: (val: string) => void;
  error?: string[];
}) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  // Building icon SVG
  const buildingIcon = (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 21V6.75A1.5 1.5 0 0 1 6 5.25h6A1.5 1.5 0 0 1 13.5 6.75V21M9 21v-3.75M15 21V9.75A1.5 1.5 0 0 1 16.5 8.25H18A1.5 1.5 0 0 1 19.5 9.75V21M7.5 8.25h3M7.5 11.25h3"
      />
    </svg>
  );

  return (
    <Select
      id="business"
      name="businessId"
      value={value}
      onChange={onChange}
      options={businesses}
      placeholder={t("selectBusinessLabel")}
      error={error}
      icon={buildingIcon}
      required
    />
  );
}
