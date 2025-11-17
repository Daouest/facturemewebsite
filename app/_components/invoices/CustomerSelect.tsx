import { CustomerField } from "@/app/_lib/types/definitions";
import { createTranslator } from "@/app/_lib/utils/format";
import { useLangageContext } from "@/app/_context/langageContext";
import Select from "@/app/_components/shared/Select";

export default function CustomerSelect({
  customers,
  value,
  onChange,
  error,
}: {
  customers: CustomerField[];
  value: string;
  onChange: (val: string) => void;
  error?: string[];
}) {
  const { langage } = useLangageContext();
  const t = createTranslator(langage);

  // User icon SVG
  const userIcon = (
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
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );

  return (
    <Select
      id="customer"
      name="customerId"
      value={value}
      onChange={onChange}
      options={customers}
      placeholder={t("selectClientLabel")}
      error={error}
      icon={userIcon}
      required
    />
  );
}
