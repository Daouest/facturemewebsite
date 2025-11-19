'use server';

import mongoose from "mongoose";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { InvoiceForm } from "@/app/lib/definitions";
import { DbFacture, DbObjetFacture, DbTauxHoraireFacture } from "@/app/lib/models";
import { fetchNextFactureId, validateInvoiceNumber, fetchObjectsByIds, fetchHourlyRatesByIds, getFactureData } from "@/app/lib/data";
import { getUserFromCookies } from "../session/session-node";
import { validateFormData, createInvoiceDocuments, validateDocuments, convertToItemTable } from '@/app/lib/invoice-helpers';

export type InvoiceCreationFormState = {
    errors?: {
        customerId?: string[];
        number?: string[];
        businessId?: string[];
        invoiceType?: string[];
        dateType?: string[];
        invoiceDate?: string[];
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

export async function createInvoice(prevState: InvoiceCreationFormState, formData: FormData) {
    // Parse and validate form data first
    const { invoiceForm, errors: validationErrors } = validateFormData(formData);

    if (validationErrors && Object.keys(validationErrors).length > 0) {
        return errorResponse("Missing or invalid fields, failed to create invoice", invoiceForm, validationErrors);
    }

    // Ensure user is authenticated and get connected user id
    const user = await getUserFromCookies();
    if (!user) {
        return errorResponse("User not authenticated", invoiceForm);
    }
    const connectedUserId = user.idUser;

    // Separate product and hourly IDs for parallel fetching
    const productIds = invoiceForm.items.filter(item => item.type === 'product').map(item => item.id);
    const hourlyIds = invoiceForm.items.filter(item => item.type === 'hourly').map(item => item.id);

    // Single batch of database calls - all parallel
    const [products, hourlyRates, nextId, numberUsed] = await Promise.all([
        productIds.length > 0 ? fetchObjectsByIds(productIds) : Promise.resolve([]),
        hourlyIds.length > 0 ? fetchHourlyRatesByIds(hourlyIds) : Promise.resolve([]),
        fetchNextFactureId(),
        invoiceForm.numberType === "custom"
            ? validateInvoiceNumber(Number(invoiceForm.number))
            : Promise.resolve(false)
    ]);

    //Return error if invoice number is already used
    if (numberUsed){
        return errorResponse("Invoice number already used", invoiceForm, { number: ["Number already used"] });
    }

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
    
    // Determine date based on dateType
    const dateFacture = invoiceForm.dateType === 'future' && invoiceForm.invoiceDate
        ? new Date(invoiceForm.invoiceDate)
        : new Date();
    
    const idClient = Number(invoiceForm.customerId);
    const idBusiness = invoiceForm.invoiceType === 'company' && invoiceForm.businessId 
        ? Number(invoiceForm.businessId) 
        : undefined;
    const isBusinessInvoice = invoiceForm.invoiceType === 'company';

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
                isBusinessInvoice: isBusinessInvoice,
                idClient,
                ...(idBusiness !== undefined && { idBusiness })
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

    revalidatePath('/homePage');
    redirect('/homePage');
}