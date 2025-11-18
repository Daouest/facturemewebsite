import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TableItemType, TableFactureType, HourlyRateType, InvoiceFormItem, Objet, TauxHoraire, ItemTable, ItemIdentifier, Facture, Ticket } from "@/app/lib/definitions"
import { translations } from "@/app/lib/constante"


const TAX_RATES = {
    TVS: 5,
    TVQ: 9.975,
}

export function toStringOrEmpty(val: FormDataEntryValue | null): string {
    return typeof val === 'string' ? val : '';
}

export function formatIntoDecimal(
    value: number | string,
    locale = "fr-CA",
    currency = "CAD"
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
    const [type, id] = key.split('-');
    return {
        id: parseInt(id),
        type: type as 'product' | 'hourly'
    };
}

// Helper function to create a unique key
export function createItemKey(id: number, type: 'product' | 'hourly'): string {
    return `${type}-${id}`;
}

export function parseItems(formData: FormData): {
    items: InvoiceFormItem[];
    itemErrors: { [itemIndex: number]: { [field: string]: string[] } };
} {
    const items: InvoiceFormItem[] = [];
    const itemErrors: { [itemIndex: number]: { [field: string]: string[] } } = {};
    let idx = 0;

    while (true) {
        const objectIdRaw = formData.get(`items[${idx}][id]`);
        const typeRaw = formData.get(`items[${idx}][type]`);

        if (objectIdRaw === null && typeRaw === null) break;

        const id = Number(objectIdRaw);
        const type = typeRaw === 'product' || typeRaw === 'hourly' ? typeRaw : undefined;

        // Initialize error object for this item
        itemErrors[idx] = {};

        // Always add items to preserve form state, even if invalid
        if (objectIdRaw === null || objectIdRaw === undefined || objectIdRaw === '' || isNaN(id) || id < 0 || !type) {
            itemErrors[idx].general = [`Invalid item at index ${idx}`];
            // Still add a placeholder item to preserve form structure
            if (type === 'product') {
                items.push({ id: id || 0, type: 'product', quantity: 1 });
            } else if (type === 'hourly') {
                items.push({
                    id: id || 0,
                    type: 'hourly',
                    breakTime: 0,
                    startTime: '',
                    endTime: ''
                });
            }
        } else {
            if (type === 'product') {
                const quantityRaw = formData.get(`items[${idx}][quantity]`);
                const quantity = Number(quantityRaw);

                if (isNaN(quantity) || quantity < 1) {
                    itemErrors[idx].quantity = [`La quantité doit être d'au moins 1`];
                    // Add item with default quantity to preserve form state
                    items.push({ id, type: 'product', quantity: 1 });
                } else {
                    const item: InvoiceFormItem = { id, type: 'product', quantity };
                    items.push(item);
                }
            } else if (type === 'hourly') {
                const breakTimeRaw = formData.get(`items[${idx}][breakTime]`);
                const startTimeRaw = formData.get(`items[${idx}][startTime]`);
                const endTimeRaw = formData.get(`items[${idx}][endTime]`);

                const breakTime = Number(breakTimeRaw);
                const startTime = String(startTimeRaw || '');
                const endTime = String(endTimeRaw || '');

                // Always add the item to preserve form state, but validate for errors
                const item: InvoiceFormItem = {
                    id,
                    type: 'hourly',
                    breakTime: isNaN(breakTime) ? 0 : Math.max(0, breakTime),
                    startTime,
                    endTime
                };
                items.push(item);

                // Add validation errors for specific fields
                if (isNaN(breakTime) || breakTime < 0) {
                    itemErrors[idx].breakTime = [`Le temps de pause doit être 0 ou plus`];
                }
                if (!startTime) {
                    itemErrors[idx].startTime = [`L'heure de début est requise`];
                }
                if (!endTime) {
                    itemErrors[idx].endTime = [`L'heure de fin est requise`];
                }
                if (startTime && endTime && startTime >= endTime) {
                    itemErrors[idx].endTime = [`L'heure de fin doit être après l'heure de début`];
                }
            }
        }

        // Clean up empty error objects
        if (Object.keys(itemErrors[idx]).length === 0) {
            delete itemErrors[idx];
        }

        idx++;
    }
    return { items, itemErrors };
}

// Helper function to calculate hours worked for hourly items
export function calculateWorkedHours(startTime: string, endTime: string, breakTimeMinutes: number): number {
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

export function calculateTotalByWorkedHours(hourlyRate: number, startTime: string, endTime: string, breakTimeMinutes: number): number {
    const hoursWorked = calculateWorkedHours(startTime, endTime, breakTimeMinutes);
    return Math.round(hoursWorked * hourlyRate * 100) / 100; // Round to 2 decimal places //Math.round only uses integers
}
// Convert form items to ItemTable after fetching from DB
export async function convertToItemTable(
    formItems: InvoiceFormItem[],
    fetchedProducts: (Objet | null)[],
    fetchedRates: (TauxHoraire | null)[]
): Promise<ItemTable> {
    // Create maps using composite keys
    const productMap = new Map(
        fetchedProducts.filter((p): p is Objet => p !== null).map(p => [createItemKey(p.idObjet, 'product'), p])
    );
    const rateMap = new Map(
        fetchedRates.filter((r): r is TauxHoraire => r !== null).map(r => [createItemKey(r.idObjet, 'hourly'), r])
    );

    const itemTable: ItemTable = [];

    for (const formItem of formItems) {
        const itemKey = createItemKey(formItem.id, formItem.type);

        if (formItem.type === 'product') {
            const product = productMap.get(itemKey);
            if (product) {
                itemTable.push(product);
            }
        } else if (formItem.type === 'hourly') {
            const rate = rateMap.get(itemKey);
            if (rate) {
                itemTable.push(rate);
            }
        }
    }

    return itemTable;
}

// Helper function to check if an item is an Objet
export function isObjet(item: any): item is Objet {
    return typeof item === "object" &&
        "idObjet" in item &&
        "productName" in item &&
        "price" in item;
}

export function isTableItem(row: TableItemType | Facture | HourlyRateType | Ticket | undefined): row is TableItemType {
    if (typeof row === "object" && "idObjet" in row && !("hourlyRate" in row)) {
        return true;
    }
    return false;
}

export function isTableHourlyRate(row: HourlyRateType | Facture | TableItemType | Ticket | undefined): row is HourlyRateType {
    if (typeof row === "object" && "idObjet" in row && "hourlyRate" in row && !("idFacture" in row)) {
        return true;
    }
    return false;
}

export function isTableFacture(row: TableItemType | Facture | HourlyRateType | Ticket | undefined): row is Facture {

    if (typeof row === "object" && "idFacture" in row) {
        return true;
    }
    return false
}
export function dateToSting(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date
    const stringDate = d.toLocaleDateString("fr-CA")
    return stringDate
}

export function getDateNow() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;// padStart:ajoute un zéro devant si le mois est sur un seul chiffre
}
// Helper function to check if an item is a TauxHoraire
export function isTauxHoraire(item: any): item is TauxHoraire {
    return typeof item === "object" &&
        "idObjet" in item &&
        "workPosition" in item &&
        "hourlyRate" in item &&
        "clientName" in item;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function createTranslator(langage: "fr" | "en") {
    return function t(key: keyof typeof translations["fr"]) {
        return translations[langage][key];
    };
}


// Function to calculate taxes based on type, amount and province
// Returns rate and amount
export function calculateTaxes(taxableAmount: number, taxType: string, province: string): { name: string; rate: number; amount: number } | null {
    let rate = TAX_RATES[taxType as keyof typeof TAX_RATES];
    if ((taxType === "TVP" || taxType === "TVH") && province != null) {
        if (taxType === "TVP") {
            switch (province) {
                case "MB": //Manitoba
                    rate = 7;
                    break;
                case "SK": //Saskatchewan
                    rate = 6;
                    break;
                case "BC": //Colombie-Britannique
                    rate = 7;
                    break;
                default:
                    rate = 0; //Province sans TVP
            }
        }
        if (taxType === "TVH") {
            switch (province) {
                case "ON": //Ontario
                    rate = 13;
                    break;
                case "NB": //Nouveau-Brunswick
                    rate = 15;
                    break;
                case "NL": //Terre-Neuve-et-Labrador
                    rate = 15;
                    break;
                case "NS": //Nouvelle-Écosse
                    rate = 14;
                    break;
                case "PE": //Île-du-Prince-Édouard
                    rate = 15;
                    break;
                default:
                    rate = 0; //Province sans TVH
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


export function getFacturesUsersByFactureNumber(data: Facture[], _isActive = true) {
    if (!data) return [];

    const sorted = data?.filter(facture => facture.isActive === _isActive).sort((a, b) => a.factureNumber - b.factureNumber)

    return sorted;
}

export function getFacturesUsersByDate(data: Facture[], _isActive = true) {
    const sorted = data?.filter(facture => facture.isActive === _isActive).sort((a, b) => new Date(a.dateFacture).getTime() - new Date(b.dateFacture).getTime())// plus ancie et plus récents
    return sorted;
}

export function getFacturesUsersPaidInvoice(data: Facture[], _isActive = true) {

    const sorted = data?.filter(facture => facture.isActive === _isActive).sort((a, b) => Number(a.isPaid) - Number(b.isPaid))
    return sorted;

}
export function isTableTicket(row: TableItemType | Facture | Ticket | undefined): row is Ticket {

    if (typeof row === "object" && "idTicket" in row) {
        return true;
    }
    return false
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


export async function setCacheImage(key:string,url:string){
    try{
        localStorage.setItem(key,url);
    }catch(err){
        console.error("Erreur in settin the cache for image",err)
    }
}

export async function getCacheImage(key:string){
    return  localStorage.getItem(key) ?? null;
}
