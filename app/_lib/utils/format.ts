import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  TableItemType,
  TableFactureType,
  HourlyRateType,
  InvoiceFormItem,
  Objet,
  TauxHoraire,
  ItemTable,
  ItemIdentifier,
  Facture,
  Ticket,
} from "@/app/_lib/types/definitions";
import { translations } from "@/app/_lib/utils/constants";
import {
  isObjet,
  isTauxHoraire,
  isTableItem,
  isTableHourlyRate,
  isTableFacture,
  isTableTicket,
} from "@/app/_lib/database/type-guards";

// Re-export type guards for backward compatibility
export {
  isObjet,
  isTauxHoraire,
  isTableItem,
  isTableHourlyRate,
  isTableFacture,
  isTableTicket,
};

const TAX_RATES = {
  TVS: 5,
  TVQ: 9.975,
};
export function toStringOrEmpty(val: FormDataEntryValue | null): string {
  return typeof val === "string" ? val : "";
}
export function formatIntoDecimal(
  value: number | string,
  locale = "fr-CA",
  currency = "CAD",
): string {
  const n =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/\s/g, "").replace(",", "."));
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(safe);
}

// Helper function to parse item key
export function parseItemKey(key: string): ItemIdentifier {
  const [type, id] = key.split("-");
  return {
    id: parseInt(id),
    type: type as "product" | "hourly",
  };
}

// Helper function to create a unique key
export function createItemKey(id: number, type: "product" | "hourly"): string {
  return `${type}-${id}`;
}

// Helper function to calculate hours worked for hourly items
export function calculateWorkedHours(
  startTime: string,
  endTime: string,
  breakTimeMinutes: number,
): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  // Handle next day scenarios
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }
  const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  const workedMinutes = totalMinutes - breakTimeMinutes;
  return Math.max(0, workedMinutes / 60); // Convert to hours
}

export function calculateTotalByWorkedHours(
  hourlyRate: number,
  startTime: string,
  endTime: string,
  breakTimeMinutes: number,
): number {
  const hoursWorked = calculateWorkedHours(
    startTime,
    endTime,
    breakTimeMinutes,
  );
  return Math.round(hoursWorked * hourlyRate * 100) / 100; // Round to 2 decimal places //Math.round only uses integers
}
export function dateToSting(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const stringDate = d.toLocaleDateString("fr-CA");
  return stringDate;
}

export function getDateNow() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`; // padStart:ajoute un zéro devant si le mois est sur un seul chiffre
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createTranslator(langage: "fr" | "en") {
  return function t(key: keyof (typeof translations)["fr"]) {
    return translations[langage][key];
  };
}

// Function to calculate taxes based on type, amount and province
// Returns rate and amount
export function calculateTaxes(
  taxableAmount: number,
  taxType: string,
  province: string,
): { name: string; rate: number; amount: number } | null {
  let rate = TAX_RATES[taxType as keyof typeof TAX_RATES];
  if ((taxType === "TVP" || taxType === "TVH") && province != null) {
    if (taxType === "TVP") {
      switch (province) {
        case "MB": //Manitoba                    rate = 7;                    break;                case "SK": //Saskatchewan                    rate = 6;                    break;                case "BC": //Colombie-Britannique                    rate = 7;                    break;                default:                    rate = 0; //Province sans TVP
      }
    }
    if (taxType === "TVH") {
      switch (province) {
        case "ON": //Ontario                    rate = 13;                    break;                case "NB": //Nouveau-Brunswick                    rate = 15;                    break;                case "NL": //Terre-Neuve-et-Labrador                    rate = 15;                    break;                case "NS": //Nouvelle-Écosse                    rate = 14;                    break;                case "PE": //Île-du-Prince-Édouard                    rate = 15;                    break;                default:                    rate = 0; //Province sans TVH
      }
    }
  }

  if (rate !== undefined || rate === 0) {
    let arrayTaxes: { name: string; rate: number; amount: number }[] = [];
    const amount = Math.round(taxableAmount * (rate / 100) * 100) / 100; // Round to 2 decimal places //Math.round only uses integers
    arrayTaxes.push({ name: taxType, rate, amount });
    return arrayTaxes[0];
  }

  return null;
}

export function getFacturesUsersByFactureNumber(
  data: Facture[],
  _isActive = true,
) {
  if (!data) return [];
  const sorted = data
    ?.filter((facture) => facture.isActive === _isActive)
    .sort((a, b) => a.factureNumber - b.factureNumber);
  return sorted;
}

export function getFacturesUsersByDate(data: Facture[], _isActive = true) {
  const sorted = data
    ?.filter((facture) => facture.isActive === _isActive)
    .sort(
      (a, b) =>
        new Date(a.dateFacture).getTime() - new Date(b.dateFacture).getTime(),
    ); // plus ancie et plus récents
  return sorted;
}

export function getFacturesUsersPaidInvoice(data: Facture[], _isActive = true) {
  const sorted = data
    ?.filter((facture) => facture.isActive === _isActive)
    .sort((a, b) => Number(a.isPaid) - Number(b.isPaid));
  return sorted;
}
export function showLongText(message: string) {
  let udpdateMessage = message;
  if (message.length > 20) {
    message = message.slice(0, 20);
    udpdateMessage = message + "...";
    return udpdateMessage;
  }
  return udpdateMessage;
}
