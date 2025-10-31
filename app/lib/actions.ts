'use server';

import mongoose from "mongoose";
import { DbFacture, DbObjetFacture, DbTauxHoraireFacture } from "@/app/lib/models";
import { fetchNextFactureId, validateInvoiceNumber, fetchItemsByIds, fetchHourlyRatesByIds } from "@/app/lib/data";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseItems, isObjet, isTauxHoraire, convertToItemTable } from '@/app/lib/utils';
import { InvoiceForm, ItemFacture, TauxHoraireFacture, InvoiceFormItem, ItemTable } from "@/app/lib/definitions";

export type InvoiceCreationFormState = {
    errors?: {
        customerId?: string[];
        number?: string[];
        businessId?: string[];
        items?: { [itemIndex: number]: { [field: string]: string[] } };
        general?: string[];
    };
    message?: string | null;
    formData?: InvoiceForm
}

function errorResponse(
    message: string,
    formData: InvoiceForm,
    errors?: InvoiceCreationFormState["errors"]
): InvoiceCreationFormState {
    return {
        errors,
        message,
        formData
    };
}

// Updated helper function to parse datetime-local format
function parseDateTimeLocal(datetimeString: string): Date {
    // datetime-local format: YYYY-MM-DDTHH:MM
    return new Date(datetimeString);
}

function validateFormData(formData: FormData): {
    invoiceForm: InvoiceForm;
    errors: InvoiceCreationFormState["errors"];
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

    return { invoiceForm, errors };
}

function createInvoiceDocuments(
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

function validateDocuments(
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

export async function createInvoice(prevState: InvoiceCreationFormState, formData: FormData) {
    const connectedUserId = 0; // TODO: Use actual user ID

    // Parse and validate form data first
    const { invoiceForm, errors: validationErrors } = validateFormData(formData);
    
    // Fix: Handle the case where validationErrors might be undefined
    if (validationErrors && Object.keys(validationErrors).length > 0) {
        return errorResponse("Missing or invalid fields, failed to create invoice", invoiceForm, validationErrors);
    }

    // Separate product and hourly IDs for parallel fetching
    const productIds = invoiceForm.items.filter(item => item.type === 'product').map(item => item.id);
    const hourlyIds = invoiceForm.items.filter(item => item.type === 'hourly').map(item => item.id);

    // Single batch of database calls - all parallel
    const [products, hourlyRates, nextId, isNumberUsed] = await Promise.all([
        productIds.length > 0 ? fetchItemsByIds(productIds) : Promise.resolve([]),
        hourlyIds.length > 0 ? fetchHourlyRatesByIds(hourlyIds) : Promise.resolve([]),
        fetchNextFactureId(),
        invoiceForm.numberType === "custom" 
            ? validateInvoiceNumber(Number(invoiceForm.number))
            : Promise.resolve(false)
    ]);

    // Convert to ItemTable using the utility function
    const itemTable = await convertToItemTable(invoiceForm.items, products, hourlyRates);

    // Validate all items exist
    if (itemTable.length !== invoiceForm.items.length) {
        // Find which items are missing and create proper error structure
        const itemErrors: { [itemIndex: number]: { [field: string]: string[]; } } = {};
        
        invoiceForm.items.forEach((item, index) => {
            const foundItem = itemTable.find(tableItem => {
                return tableItem.idObjet === item.id && 
                       ('productName' in tableItem ? 'product' : 'hourly') === item.type;
            });
            if (!foundItem) {
                itemErrors[index] = {
                    id: ["Invalid item selected"]
                };
            }
        });
        
        return errorResponse("Missing or invalid fields, failed to create invoice", invoiceForm, { items: itemErrors });
    }

    // Prepare invoice data
    const idFacture = nextId;
    const dateFacture = new Date();
    
    // Determine typeFacture based on item types
    const hasProducts = productIds.length > 0;
    const hasHourlyRates = hourlyIds.length > 0;
    
    let typeFacture: 'U' | 'T' | 'P';
    if (hasProducts && hasHourlyRates) {
        typeFacture = 'P'; // Mixed: products and hourly rates
    } else if (hasHourlyRates) {
        typeFacture = 'T'; // Only hourly rates
    } else {
        typeFacture = 'U'; // Only products (items)
    }
    
    const factureNumber = invoiceForm.numberType === "custom" ? Number(invoiceForm.number) : idFacture;

    // Create documents using optimized function
    const { productDocs, hourlyDocs } = createInvoiceDocuments(
        invoiceForm.items, 
        itemTable, 
        idFacture
    );

    // Validate documents before saving
    if (!validateDocuments(productDocs, hourlyDocs)) {
        return errorResponse("Document validation failed", invoiceForm);
    }

    // Save to database with transaction
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            // Save facture first
            const facture = new DbFacture({
                idFacture,
                idUser: connectedUserId,
                dateFacture,
                typeFacture,
                factureNumber,
                includesTaxes: false,
                isActive: true,
                isPaid: false,
                isBusinessInvoice: false
            });

            await facture.save({ session });
            
            // Then save related documents
            if (productDocs.length > 0) {
                await DbObjetFacture.insertMany(productDocs, { session });
            }
            
            if (hourlyDocs.length > 0) {
                await DbTauxHoraireFacture.insertMany(hourlyDocs, { session });
            }
        });
    } catch (error: any) {
        console.error("Database error:", error?.message || error);
        
        // Handle specific error types
        if (error?.code === 11000) {
            return errorResponse("Duplicate invoice number", invoiceForm);
        }
        
        if (error?.name === 'ValidationError') {
            return errorResponse("Data validation failed", invoiceForm);
        }
        
        return errorResponse("Server error, failed to create invoice", invoiceForm);
    } finally {
        await session.endSession();
    }

    revalidatePath('/invoices');    
    redirect('/invoices');
}