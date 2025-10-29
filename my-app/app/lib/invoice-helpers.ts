import { DbObjetFacture, DbTauxHoraireFacture } from "@/app/lib/models";
import { Objet, TauxHoraire, InvoiceForm, ItemFacture, TauxHoraireFacture, InvoiceFormItem, ItemTable } from "@/app/lib/definitions";
import { createItemKey } from "./utils";
import { InvoiceCreationFormState } from "@/app/lib/actions/invoice-creation-actions";

// Updated helper function to parse datetime-local format
export function parseDateTimeLocal(datetimeString: string): Date {
    return new Date(datetimeString);
}

export function validateFormData(formData: FormData): {
    invoiceForm: InvoiceForm;
    errors: any;
} {
    const customerIdRaw = formData.get('customerId');
    const businessIdRaw = formData.get('businessId');
    const numberTypeRaw = formData.get('numberType');
    const customNumber = formData.get('number');
    const numberType: 'auto' | 'custom' | undefined =
        numberTypeRaw === 'auto' || numberTypeRaw === 'custom' ? numberTypeRaw : undefined;

    // Parse items
    const { items, itemErrors } = parseItems(formData);

    const invoiceForm: InvoiceForm = {
        customerId: customerIdRaw ? String(customerIdRaw) : '',
        businessId: businessIdRaw ? String(businessIdRaw) : '',
        numberType: numberType || 'auto',
        number: customNumber ? String(customNumber) : '',
        items: items
    };

    const errors: InvoiceCreationFormState["errors"] = {};

    // Early validation - fail fast approach - Updated to handle ID 0
    const customerId = customerIdRaw !== null ? Number(customerIdRaw) : null;
    const businessId = businessIdRaw !== null ? Number(businessIdRaw) : null;

    // Check for null/undefined AND invalid numbers, but allow 0
    if (customerId === null || isNaN(customerId) || customerId < 0) {
        errors.customerId = ["Le client est requis"];
    }
    if (businessId === null || isNaN(businessId) || businessId < 0) {
        errors.businessId = ["L'entreprise est requise"];
    }

    // Item validation
    if (items.length === 0) {
        errors.general = ["Au moins un élément valide est requis"];
    } else if (Object.keys(itemErrors).length > 0) {
        errors.items = itemErrors;
    }

    // Custom number validation
    if (numberType === "custom") {
        const factureNumber = Number(customNumber);
        if (customNumber === null || customNumber === undefined || customNumber === '' || isNaN(factureNumber) || factureNumber < 0) {
            errors.number = ["Un numéro de facture valide est requis"];
        }
    }

    // Check for duplicate items using composite keys
    const seenItems = new Set<string>();
    const duplicateErrors: { [itemIndex: number]: { [field: string]: string[] } } = {};

    items.forEach((item, index) => {
        const itemKey = createItemKey(item.id, item.type);
        if (seenItems.has(itemKey)) {
            if (!duplicateErrors[index]) {
                duplicateErrors[index] = {};
            }
            duplicateErrors[index].general = ['Cet élément a déjà été ajouté'];
        }
        seenItems.add(itemKey);
    });

    // Merge duplicate errors with existing item errors
    if (Object.keys(duplicateErrors).length > 0) {
        Object.keys(duplicateErrors).forEach(indexStr => {
            const index = parseInt(indexStr);
            if (!itemErrors[index]) {
                itemErrors[index] = {};
            }
            Object.assign(itemErrors[index], duplicateErrors[index]);
        });
    }

    return { invoiceForm, errors };
}

export function createInvoiceDocuments(
    items: InvoiceFormItem[],
    itemTable: ItemTable,
    idFacture: number,
): { productDocs: ItemFacture[]; hourlyDocs: TauxHoraireFacture[] } {
    const productDocs: ItemFacture[] = [];
    const hourlyDocs: TauxHoraireFacture[] = [];

    for (let i = 0; i < items.length; i++) {
        const formItem = items[i];
        const dbItem = itemTable[i];

        if (formItem.type === 'product' && isObjet(dbItem)) {
            const productDoc: ItemFacture = {
                idFacture,
                idColumn: i + 1,
                productName: dbItem.productName,
                description: dbItem.description,
                quantity: formItem.quantity,
                pricePerUnit: dbItem.price,
                productPhoto: 'https://REMOVE-THIS-FAKE-URL-BEFORE-PRODUCTION.com/placeholder.jpg'
            };
            productDocs.push(productDoc);
        } else if (formItem.type === 'hourly' && isTauxHoraire(dbItem)) {
            const startDate = parseDateTimeLocal(formItem.startTime!);
            const endDate = parseDateTimeLocal(formItem.endTime!);

            const hourlyDoc: TauxHoraireFacture = {
                idFacture,
                idColumn: i + 1,
                workPosition: dbItem.workPosition,
                hourlyRate: dbItem.hourlyRate,
                workingDate: startDate,
                startTime: startDate,
                endTime: endDate,
                lunchTimeInMinutes: formItem.breakTime
            };
            hourlyDocs.push(hourlyDoc);
        }
    }

    return { productDocs, hourlyDocs };
}

export function validateDocuments(
    productDocs: ItemFacture[],
    hourlyDocs: TauxHoraireFacture[]
): boolean {
    // More efficient validation - stop at first error
    const productErrors = productDocs.some(doc => {
        const validation = new DbObjetFacture(doc).validateSync();
        console.log(validation);
        return validation !== null && validation !== undefined;
    });

    if (productErrors) return false;

    const hourlyErrors = hourlyDocs.some(doc => {
        const validation = new DbTauxHoraireFacture(doc).validateSync();
        console.log(validation);
        return validation !== null && validation !== undefined;
    });

    return !hourlyErrors;
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

// Helper function to check if an item is an Objet
export function isObjet(item: any): item is Objet {
    return typeof item === "object" &&
        "idObjet" in item &&
        "productName" in item &&
        "price" in item;
}

// Helper function to check if an item is a TauxHoraire
export function isTauxHoraire(item: any): item is TauxHoraire {
    return typeof item === "object" &&
        "idObjet" in item &&
        "workPosition" in item &&
        "hourlyRate" in item &&
        "clientName" in item;
}

// Convert form items to ItemTable after fetching from DB
export async function convertToItemTable(
    formItems: InvoiceFormItem[],
    fetchedProducts: (Objet | null)[],
    fetchedRates: (TauxHoraire | null)[]
): Promise<ItemTable> {
    // Pre-filter and create maps for O(1) lookup
    const productMap = new Map(
        fetchedProducts.filter((p): p is Objet => p !== null).map(p => [p.idObjet, p])
    );
    const rateMap = new Map(
        fetchedRates.filter((r): r is TauxHoraire => r !== null).map(r => [r.idObjet, r])
    );

    const itemTable: ItemTable = [];

    for (const formItem of formItems) {
        if (formItem.type === 'product') {
            const product = productMap.get(formItem.id);
            if (product) {
                itemTable.push(product);
            }
        } else if (formItem.type === 'hourly') {
            const rate = rateMap.get(formItem.id);
            if (rate) {
                itemTable.push(rate);
            }
        }
    }

    return itemTable;
}