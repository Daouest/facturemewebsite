import { connectToDatabase } from "@/app/lib/db/mongodb";
import { DbObjet, DbBusiness, DbTauxHoraire, DbClient, DbFacture, DbObjetFacture, DbFactureHoraire, DbUsers, DbAddress } from "@/app/lib/models";
import { CustomerField, BusinessField, ObjectField, Facture, Objet, FactureUnitaire, FactureHoraire, Business, ItemField, ItemFieldWithPrice, TauxHoraire } from "@/app/lib/definitions";
import { ItemData, UserData, Address, Client, ClientAffichage } from "@/app/lib/definitions";
import { calculateTotalByWorkedHours, calculateTaxes } from "@/app/lib/utils";
import { getUserFromCookies } from "@/app/lib/session/session-node";
export const runtime = "nodejs"

export async function fetchCustomers() {
    try {
        const user = await getUserFromCookies();
        if (!user) return [] as CustomerField[];

        const clients = await DbClient.find(
            { idUser: user.idUser },
            { idClient: 1, nomClient: 1, _id: 0 }
        ).sort({ nomClient: 1 }).lean();

        return clients.map((client) => ({
            id: client.idClient,
            name: client.nomClient,
        })) as CustomerField[];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch all customers.');
    }
}

export async function fetchClientByUserId(idUser: number) {
    try {
        const clients = await DbClient.find({ idUser }).lean<Client[]>();

        //Clients affichage (addresse jointe)
        const clientsAffichage: ClientAffichage[] = [];
        for (const client of clients) {
            const addressResponse = await getAddressInfo(client.idAddress);
            let address: Address = addressResponse.success && addressResponse.addressData ? addressResponse.addressData : {} as Address;
            clientsAffichage.push({
                idClient: client.idClient,
                nomClient: client.nomClient,
                address: address
            });
        }

        if (!clientsAffichage) return { success: false, message: "Client non trouvé" };
        return { success: true, message: "Succès dans la récupération du client", clients: clientsAffichage };
    } catch (err) {
        console.error("Erreur dans la fonctions getClientByUserId", err);
        return { success: false, message: "Erreur dans la récupération du client" };
    }
}

export async function fetchBusinesses() {
    try {
        const user = await getUserFromCookies();
        if (!user) return [] as BusinessField[];

        const businesses = await DbBusiness.find(
            { idUser: user.idUser },
            { idBusiness: 1, businessName: 1, _id: 0 }
        ).sort({ businessName: 1 }).lean();

        return businesses.map((business) => ({
            id: business.idBusiness,
            name: business.businessName,
        })) as BusinessField[];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch all businesses.');
    }
}

export async function fetchBusinessInfo(idBusiness: number) {
    try {
        const business = await DbBusiness.findOne({ idBusiness }).lean<Business | null>();
        if (!business) return { success: false, message: "Business non trouvée" };
        return { success: true, message: "Succès dans la récupération de la business", businessInfo: business };
    }
    catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch business.');
    }
}

export async function fetchBusinessInfoByUserId(idUser: number) {
    try {
        const user = await getUserInfo(idUser);
        if (!user.success || !user.userData) {
            return { success: false, message: "Utilisateur non trouvé" };
        }
        if (user.userData.idBusiness == null) {
            return { success: false, message: "L'utilisateur n'est pas associé à une entreprise" };
        }
        const business = await DbBusiness.findOne({ idBusiness: user.userData.idBusiness }).lean<Business | null>();
        if (!business) return { success: false, message: "Business non trouvée" };
        return { success: true, message: "Succès dans la récupération de la business", businessInfo: business };
    }
    catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch business.');
    }
}


export async function fetchCustomerInfo(idClient: number) {
    try {
        const client = await DbClient.findOne({ idClient }).lean<Client | null>();
        if (!client) return { success: false, message: "Client non trouvé" };
        return { success: true, message: "Succès dans la récupération du client", customerInfo: client };
    }
    catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch customer.');
    }
}

export async function fetchObjects() {
    try {
        const user = await getUserFromCookies();
        if (!user) return [] as ObjectField[];

        const objects = await DbObjet.find(
            { idUser: user.idUser },
            { idObjet: 1, productName: 1, _id: 0 }
        ).sort({ productName: 1 }).lean();

        return objects.map((object) => ({
            id: object.idObjet,
            name: object.productName,
        })) as ObjectField[];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch all objects.');
    }
}

export async function fetchNextFactureId() {
    const lastFacture = await DbFacture.findOne().sort({ idFacture: -1 }).lean<Facture | null>();
    return lastFacture ? lastFacture.idFacture + 1 : 1;
}

export async function fetchNextAddressId() {
    const lastAddress = await DbAddress.findOne().sort({ idAddress: -1 }).lean<Address | null>();
    return lastAddress ? lastAddress.idAddress + 1 : 1;
}

export async function fetchNextClientId() {
    const lastClient = await DbClient.findOne().sort({ idClient: -1 }).lean<Client | null>();
    return lastClient ? lastClient.idClient + 1 : 1;
}

export async function fetchNextObjetId() {
    const lastObjet = await DbObjet.findOne().sort({ idObjet: -1 }).lean<Objet | null>();
    return lastObjet ? lastObjet.idObjet + 1 : 1;
}

export async function fetchObjectById(id: number) {
    const obj = await DbObjet.findOne({ idObjet: id }).lean<Objet | null>();
    return obj;
}

export async function validateInvoiceNumber(invoiceNumber: number) {
    const user = await getUserFromCookies();
    if (!user) return false;

    const existing = await DbFacture.findOne({
        factureNumber: invoiceNumber,
        idUser: user.idUser
    }).lean();
    return !!existing;
}

export async function fetchObjectsByIds(ids: number[]) {
    if (!ids.length) return [];
    const objects = await DbObjet.find({ idObjet: { $in: ids } }).lean<Objet[]>();
    const objectMap = new Map(objects.map(obj => [obj.idObjet, obj]));
    return ids.map(id => objectMap.get(id) || null);
}

export async function getFactureData(idFacture: number) {
    try {
        const factureData = await DbFacture.findOne({ idFacture }).lean<Facture | null>();
        if (!factureData) return { success: false, message: "Facture non trouvée" };
        return { success: true, message: "Succès dans la récupération de la facture", facture: factureData };
    } catch (err) {
        console.error("Erreur dans la fonctions getFactureData", err);
        return { success: false, message: "Erreur dans la récupération de la facture" };
    }
}

export async function getFactureDetails(idFacture: number) {
    try {
        const factureResponse = await getFactureData(idFacture);
        const typeFacture = factureResponse.facture?.typeFacture;
        let factureDetails;

        const factureU = await DbObjetFacture.find({ idFacture }).lean<FactureUnitaire | null>();
        const factureH = await DbFactureHoraire.find({ idFacture }).lean<FactureHoraire | null>();
        factureDetails = { factureU, factureH };
        if (!factureDetails) return { success: false, message: "Facture non trouvée" };
        return { success: true, message: "Succès dans la récupération de la facture", factureDetails: factureDetails };
    } catch (err) {
        console.error("Erreur dans la fonctions getFactureData", err);
        return { success: false, message: "Erreur dans la récupération des details de la facture" };
    }
}

export async function getUserInfo(idUser: number) {
    try {
        const userData = await DbUsers.findOne({ idUser }).lean<UserData | null>();
        if (!userData) return { success: false, message: "Utilisateur non trouvé" };
        return { success: true, message: "Succès dans la récupération de l'utilisateur", userData: userData };
    } catch (err) {
        console.error("Erreur dans la fonctions getUserInfo", err);
        return { success: false, message: "Erreur dans la récupération de l'utilisateur" };
    }
}
export async function getUserInfoByEmail(_email: string) {
    try {
        const userData = await DbUsers.findOne({ email: _email });

        if (!userData) return null
        return userData.idUser;
    } catch (err) {
        console.error("Erreur dans la fonctions getUserInfo", err);
        return { success: false, message: "Erreur dans la récupération de l'utilisateur" };
    }
}

export async function getAddressInfo(idAddress: number) {
    try {
        const addressData = await DbAddress.findOne({ idAddress }).lean<Address | null>();
        if (!addressData) return { success: false, message: "Addresse non trouvée" };
        return { success: true, message: "Succès dans la récupération de l'adresse", addressData: addressData };
    } catch (err) {
        console.error("Erreur dans la fonctions getAddressInfo", err);
        return { success: false, message: "Erreur dans la récupération de l'addresse" };
    }
}

export async function fetchObjectsAndRates() {
    try {
        const user = await getUserFromCookies();
        if (!user) return [] as ItemFieldWithPrice[];

        const objects = await DbObjet.find(
            { idUser: user.idUser },
            { idObjet: 1, productName: 1, price: 1, _id: 0 }
        ).sort({ productName: 1 }).lean();

        const rates = await DbTauxHoraire.find(
            { idUser: user.idUser },
            { idObjet: 1, workPosition: 1, hourlyRate: 1, _id: 0 }
        ).sort({ workPosition: 1 }).lean();

        const productObjects: ItemFieldWithPrice[] = objects.map((object) => ({
            id: object.idObjet,
            name: object.productName,
            type: 'product' as const,
            price: object.price,
        }));

        const hourlyObjects: ItemFieldWithPrice[] = rates.map((rate) => ({
            id: rate.idObjet,
            name: rate.workPosition,
            type: 'hourly' as const,
            hourlyRate: rate.hourlyRate,
        }));

        return [...productObjects, ...hourlyObjects];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch all objects.');
    }
}

export async function fetchItemsByIds(ids: number[]): Promise<(Objet | null)[]> {
    if (!ids.length) return [];

    try {
        const objects = await DbObjet.find(
            { idObjet: { $in: ids } },
            { _id: 0 } // Exclude MongoDB _id for better performance
        ).lean<Objet[]>();

        // Create a Map for O(1) lookup instead of O(n) for each id
        const objectMap = new Map(objects.map(obj => [obj.idObjet, obj]));
        return ids.map(id => objectMap.get(id) || null);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch items by IDs.');
    }
}

export async function fetchHourlyRatesByIds(ids: number[]): Promise<(TauxHoraire | null)[]> {
    if (!ids.length) return [];

    try {
        const objects = await DbTauxHoraire.find(
            { idObjet: { $in: ids } },
            { _id: 0 } // Exclude MongoDB _id for better performance
        ).lean<TauxHoraire[]>();

        // Create a Map for O(1) lookup instead of O(n) for each id
        const objectMap = new Map(objects.map(obj => [obj.idObjet, obj]));
        return ids.map(id => objectMap.get(id) || null);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch hourly rates by IDs.');
    }
}

export async function getImageItem(idItem: number) {
    try {
        const itemData = await DbObjet.findOne({ idObjet: idItem });
        if (itemData.productPhoto) {
            return itemData.productPhoto

        }
        return null


    } catch (err) {
        console.error("Erreur dans la fonctions getOneItems", err)
        return { success: false, message: "Erreur dans la récupération de l'item" }
    }

}

export async function getOneItem(idItem: number) {
    try {
        const itemData = await DbObjet.findOne({ idItem });

        return { success: true, message: "Succès dans la récupération de l'item", item: itemData }

    } catch (err) {
        console.error("Erreur dans la fonctions getOneItems", err)
        return { success: false, message: "Erreur dans la récupération de l'item" }
    }

}

export async function getAllItemUser() {
    try {
        const itemData = await DbObjet.aggregate([
            {
                $lookup: {
                    from: "users",          // nom de la collection Users en DB
                    localField: "idUser",   // champ dans objetsUnitaires
                    foreignField: "idUser", // champ correspondant dans Users
                    as: "userInfo"
                }
            },
            {
                $unwind: "$userInfo" // "déplie" le tableau userInfo → chaque item a son user unique
            },
            {
                $project: { // choisir les champs à garder
                    productName: 1,
                    description: 1,
                    price: 1,
                    "userInfo.username": 1,
                    "userInfo.email": 1
                }
            }
        ]);

        return { success: true, message: "Succès dans la récupération de l'item", items: itemData }

    } catch (err) {
        console.error("Erreur dans la fonctions getOneItems", err)
        return { success: false, message: "Erreur dans la récupération de l'item" }
    }

}

export async function getAllFacturesUsers(_idUser: number, _isActive = true) {
    try {


        const factureData = await DbFacture.aggregate([

            {
                $match: { idUser: _idUser, isActive: _isActive } // Filtrer par idUser
            },

            {
                $lookup: {
                    from: "clients",          // nom de la collection clients en DB
                    localField: "idClient",   // champ dans facture_user
                    foreignField: "idClient", // champ correspondant dans clients
                    as: "clientInfo"
                }
            },
            {
                $unwind: "$clientInfo" // "déplie" le tableau userInfo → chaque facture a son idClient unique
            },
            {
                $project: { // choisir les champs à garder
                    idFacture: 1,
                    idUser: 1,
                    dateFacture: 1,
                    typeFacture: 1,
                    factureNumber: 1,
                    isPaid: 1,
                    isActive: 1,
                    "clientInfo.idClient": 1,
                    "clientInfo.nomClient": 1
                }
            }
        ]);

        return factureData;

    } catch (err) {
        console.error("Erreur dans la fonctions getFactureUsersDatas", err)
    }

}
export async function deleteItemsById(idItem: number, _idUser: number) {
    try {
        await DbObjet.deleteOne({ idObjet: idItem, idUser: _idUser });
        const item = await DbObjet.findOne({ idObjet: idItem, idUser: _idUser });
        console.log("item", item);
        if (!item) return { success: true }

        return { success: false }

    } catch (err) {
        console.error("Erreur dans la supprimé deleteItemsById", err)
        return { success: false, message: "Erreur item  n'a pas été supprimé" }

    }

}
export async function getAllItems(id: number = 0) {
    try {
        const itemsData = await DbObjet.find({ idUser: id });
        // console.log("itemsData", itemsData);
        return { success: true, message: "Succès dans la récupération des produits", items: itemsData }

    } catch (err) {
        console.error("Erreur dans la fonctions getAllItems", err)
        return { success: false, message: "Erreur dans la récupération des produits" }
    }
}

export async function getAllHourlyRates(){
    try {
        const user = await getUserFromCookies();
        const idUser = user?.idUser;
        const data = await DbTauxHoraire.find({idUser: idUser});
        return { success: true, message: "Succès dans la récupération des taux horaire", hourlyRates: data }

    } catch (err) {
        console.error("Erreur dans la fonctions getAllHourlyRates", err)
        return { success: false, message: "Erreur dans la récupération des taux horaire" }
    }
}

export async function insertItem(userData: UserData, itemData: ItemData) {
    try {

        await connectToDatabase();

        const count = await fetchNextObjetId();
        console.log("idUser.id: ", userData.id);

        const Today: Date = new Date();
        const newItem = new DbObjet({
            idUser: userData.id,
            idObjet: count,
            productName: itemData.itemNom,
            description: itemData.description,
            price: itemData.prix,
            productPhoto: itemData?.image ? itemData.image : "",
            enforcementDate: Today,
            idParent: -1

        });

        const saveItem = await newItem.save();

        console.log("nouvelle objet", saveItem);
        return {
            success: true,
            message: "Item créé avec succès",
            item: itemData,
        }
    } catch (err) {
        console.error("Erreur dans le controller create item: lors de la cration d'un iem", err)
        return {
            success: false,
            message: "Item non créé ",
        }
    }

}
export async function updateItem(userData: UserData, itemData: any) {
    try {

        await connectToDatabase();

        console.log("Nom de l'item: ", itemData.itemNom);

        const Today: Date = new Date();

        const existingItem = await DbObjet.findOne({ idObjet: itemData.idObjet, idUser: userData.id });
        if (!existingItem) {

            console.error("Item non trouvé ou vous n'avez pas la permission de le modifier");
            return {
                success: false,
                message: "Item non modifié ",
            }
        }
        console.log("existingItem", existingItem.prix, existingItem.productName);
        const updateData = await DbObjet.findByIdAndUpdate(
            existingItem._id,
            {
                $set: {
                    price: itemData.prix,
                    productPhoto: itemData?.image ? itemData.image : "",
                    enforcementDate: Today,
                }
            }, { new: true }// renvoie l'item mis à jour
        );


        console.log("objet modifier", updateData);
        return {
            success: true,
            message: "Item  modifié succès",
            item: itemData,
        }
    } catch (err) {
        console.error("Erreur dans le controller create item: lors de la modification d'un item", err)
        return {
            success: false,
            message: "Item non modifié ",
        }
    }

}

export async function getLastFacture(idUser: number) {
    try {
        const result = await getAllFacturesUsers(idUser);

        const sorted = result?.sort((a, b) => {
            return new Date(b.dateFacture).getTime() - new Date(a.dateFacture).getTime()
        })
        const last3Factures = sorted?.slice(0, 3)
        return last3Factures;

    } catch (err) {
        console.error("Erreur dans la fonction getLastFacture", err)
    }
}

export async function getFacturesUsersByDate(idUser: number, isActive = true) {
    const result = await getAllFacturesUsers(idUser, isActive);

    const sorted = result?.sort((a, b) => {
        return new Date(b.dateFacture).getTime() - new Date(a.dateFacture).getTime()
    })
    return sorted;

}
export async function getFacturesUsersPaidInvoice(idUser: number, isActive = true) {
    const result = await getAllFacturesUsers(idUser, isActive);

    const sorted = result?.sort((a, b) => {
        return a.isPaid - b.isPaid
    })
    console.log("sorted", sorted);
    return sorted;

}
export async function getFacturesUsersByFactureNumber(idUser: number, isActive = true) {
    const result = await getAllFacturesUsers(idUser, isActive);

    const sorted = result?.sort((a, b) => {
        return a.factureNumber - b.factureNumber
    })

    return sorted;
}

export async function getTaxesArrayForFacture(idFacture: number) {
    // should return an array of taxes with name, rate and amount
    // "taxes": [{"name": "TPS", "rate": 5, "amount": 40.25},
    //           {"name": "TVQ", "rate": 9.975, "amount": 80.36}],

    try {
        //validations...........................................................................................................
        //facture
        const infoFacture = await getFactureData(idFacture);
        if (!infoFacture.success) return;
        if (infoFacture.facture?.isBusinessInvoice === false) return; //this only applies to business invoices
        if (infoFacture.facture?.includesTaxes === false) return;

        //business
        let idUser = infoFacture.facture?.idUser;
        if (idUser == null) return;
        const infoBusiness = await fetchBusinessInfoByUserId(idUser);

        //address
        if (!infoBusiness.success) return;
        if (infoBusiness.businessInfo?.idAddress == null) return;
        const infoAddress = await getAddressInfo(infoBusiness.businessInfo.idAddress);
        if (!infoAddress.success) return;
        if (infoAddress.addressData?.province == null) return;

        //facture details
        const factureResponse = await getFactureDetails(idFacture);
        if (!factureResponse.success) return;

        const factureData = factureResponse.factureDetails;
        if (!factureData) return;

        // Calculate subtotal.....................................................................................................
        let totalFacture = 0;
        const colHoraire = factureData?.factureH;
        const colUnitaires = factureData?.factureU;

        if (colHoraire && Array.isArray(colHoraire)) {
            colHoraire.forEach(item => {
                // Calcul cout total
                const total = calculateTotalByWorkedHours(item.hourlyRate, item.startTime, item.endTime, item.lunchTimeInMinutes);
                totalFacture += total;
            });
        }

        if (colUnitaires && Array.isArray(colUnitaires)) {
            colUnitaires.forEach(item => {
                const quantity = Number(item.quantity) || 0;
                const pricePerUnit = Number(item.pricePerUnit) || 0;

                const total = Math.round(quantity * pricePerUnit * 100) / 100;
                totalFacture += total;
            });
        }

        // Fetch facture to get province and taxes..............................................................................
        let arrayTaxes: { name: string; rate: number; amount: number }[] = [];
        let province = infoAddress.addressData?.province;

        if (infoBusiness.businessInfo?.TVHnumber) {
            const TVH = calculateTaxes(totalFacture, "TVH", province);
            if (TVH) arrayTaxes.push(TVH);
        }
        if (infoBusiness.businessInfo?.TVPnumber) {
            const TVP = calculateTaxes(totalFacture, "TVP", province);
            if (TVP) arrayTaxes.push(TVP);
        }
        if (infoBusiness.businessInfo?.TVQnumber) {
            const TVQ = calculateTaxes(totalFacture, "TVQ", province);
            if (TVQ) arrayTaxes.push(TVQ);
        }
        if (infoBusiness.businessInfo?.TVSnumber) {
            const TVS = calculateTaxes(totalFacture, "TVS", province);
            if (TVS) arrayTaxes.push(TVS);
        }

        return arrayTaxes;
    } catch (err) {
        console.error("Erreur dans la fonction getTaxesArrayForFacture", err)
    }

    return null;
}

export async function getAllTaxesNumbers(businessId: number) {
    try {
        const business = await DbBusiness.findOne({ idBusiness: businessId }).lean<Business | null>();
        if (!business) return { success: false, message: "Business non trouvée" };
        return { success: true, message: "Succès dans la récupération des numéros de taxes", taxesNumbers: { TVHnumber: business.TVHnumber, TVPnumber: business.TVPnumber, TVQnumber: business.TVQnumber, TVSnumber: business.TVSnumber } };
    }
    catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch business.');
    }
}