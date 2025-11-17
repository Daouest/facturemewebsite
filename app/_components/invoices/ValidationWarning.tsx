type Props = {
  canSubmit: boolean;
  customerId: string;
  businessId: string;
  invoiceType: "company" | "personal";
  itemsCount: number;
  t: (key: any) => string;
};
export default function ValidationWarning({
  canSubmit,
  customerId,
  businessId,
  invoiceType,
  itemsCount,
  t,
}: Props) {
  if (canSubmit) return null;
  return (
    <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200">
      {" "}
      <div className="flex items-start gap-3">
        {" "}
        <svg
          className="h-5 w-5 mt-0.5 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          {" "}
          <path
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />{" "}
        </svg>{" "}
        <div className="flex-1">
          {" "}
          <p className="font-medium text-sm">
            {t("pleaseCompleteFields")}
          </p>{" "}
          <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
            {" "}
            {!customerId && <li>{t("selectClient")}</li>}{" "}
            {invoiceType === "company" && !businessId && (
              <li>{t("selectBusiness")}</li>
            )}{" "}
            {itemsCount === 0 && <li>{t("addAtLeastOneItem")}</li>}{" "}
          </ul>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
