
import { getFactureData, getFactureDetails, fetchBusinessInfo, getUserInfo, getAddressInfo, fetchCustomerInfo, getTaxesArrayForFacture } from "@/app/lib/data";
import { getSession } from "@/app/lib/session/session-node";

export async function GET(request: Request) {

    const session = await getSession();
    const factureId = session?.factureId;
    const userId = session?.idUser; // Use idUser, not userId

    // Check if user is authenticated
    if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized - No session' }), { status: 401 });
    }

    if (typeof factureId !== "number" || isNaN(factureId)) {
        return new Response(JSON.stringify({ error: 'Invalid or missing factureId parameter' }), { status: 400 });
    }

    try {
        //chercher les données de la facture
        const factureData = await getFactureData(factureId);

        // SECURITY: Verify ownership before processing
        if (!factureData.success || !factureData.facture) {
            return new Response(JSON.stringify({ error: 'Invoice not found' }), { status: 404 });
        }

        if (factureData.facture.idUser !== userId) {
            console.warn(`Authorization failed in previsualisation: User ${userId} tried to access invoice ${factureId} owned by ${factureData.facture.idUser}`);
            return new Response(JSON.stringify({ error: 'Unauthorized - You do not own this invoice' }), { status: 403 });
        }

        //modification des données pour l'affichage
        let facture;
        let userInfos;
        let clientInfos;
        let invoiceInfos;
        let taxesnumbers: { taxName: string; taxNumber: string }[] = [];

        if (factureData && factureData.facture && factureData.facture.idUser != null) {
            //  (FIRST) -------- userInfos ------------------------------------------------------------------------------
            //1.    rechercher le user ou la compagnie
            const isBusiness = factureData.facture.isBusinessInvoice;

            //1.1   fetch idBusiness par le idUser
            const userInfoMessage = await getUserInfo(factureData.facture.idUser);
            const userInfo = userInfoMessage.userData;

            if (isBusiness === true) {
                //  chercher les infos de la business
                //1.2   fetch infos business
                if (userInfo && userInfo.idBusiness != null) {
                    const businessInfoMessage = await fetchBusinessInfo(userInfo.idBusiness);
                    const businessInfo = businessInfoMessage.businessInfo;
                    //1.3 fetch infos addresses
                    if (businessInfo && businessInfo.idAddress != null) {
                        //info addresse
                        const addresseInfoMsg = await getAddressInfo(businessInfo.idAddress);
                        const addressInfo = addresseInfoMsg.addressData;

                        //info taxes
                        if (businessInfo.TVHnumber) taxesnumbers.push({ "taxName": "TVH", "taxNumber": businessInfo.TVHnumber });
                        if (businessInfo.TVPnumber) taxesnumbers.push({ "taxName": "TVP", "taxNumber": businessInfo.TVPnumber });
                        if (businessInfo.TVQnumber) taxesnumbers.push({ "taxName": "TVQ", "taxNumber": businessInfo.TVQnumber });
                        if (businessInfo.TVSnumber) taxesnumbers.push({ "taxName": "TVS", "taxNumber": businessInfo.TVSnumber });

                        //1.4 assigner les infos
                        if (addressInfo) {
                            userInfos = {
                                "name": businessInfo.businessName,
                                "address": addressInfo.address,
                                "city": addressInfo.city,
                                "province": addressInfo.province,
                                "zipCode": addressInfo.zipCode,
                                "logo": businessInfo.businessLogo || undefined
                            }
                        }
                    }


                }

            } else {
                //1.2    fetch l'addresse user (personal invoice)
                if (userInfo && userInfo.idAddress != null) {

                    const addressMsg = await getAddressInfo(userInfo.idAddress);
                    const address = addressMsg.addressData;

                    if (address) {
                        userInfos = {
                            "name": userInfo.firstName + " " + userInfo.lastName,
                            "address": address.address,
                            "city": address.city,
                            "province": address.province,
                            "zipCode": address.zipCode
                        }
                    }
                } else {
                    console.error('Personal invoice error: User does not have a personal address set in their profile.');
                    console.error('User needs to go to Profile page and set their personal address.');
                }

            }

            //  (SECOND) -------- infoClient  ------------------------------------------------------------------------------
            //2.    chercher infos client
            if (factureData.facture.idClient != null) {
                const infoClientMsg = await fetchCustomerInfo(factureData.facture.idClient);
                const infoClient = infoClientMsg.customerInfo;

                if (infoClient) {
                    //2.1   chercher les infos du client (addresse)
                    const addClientMsg = await getAddressInfo(infoClient.idAddress);
                    const addClient = addClientMsg.addressData;

                    //2.2   mettre les infos dans la variable
                    if (addClient) {
                        clientInfos = {
                            "name": infoClient.nomClient,
                            "address": addClient.address,
                            "city": addClient.city,
                            "province": addClient.province,
                            "zipCode": addClient.zipCode
                        };
                    }
                }
            }

            //  (THIRD) -------- infos du invoice  ------------------------------------------------------------------------------
            //1.1   chercher les types
            if (factureData.facture.typeFacture) {
                const colonnes = await getFactureDetails(factureId);

                const colH = colonnes.factureDetails?.factureH;
                const colU = colonnes.factureDetails?.factureU;

                const colHoraire = colonnes.factureDetails?.factureH;
                const colUnitaires = colonnes.factureDetails?.factureU;

                let totalFacture = 0;

                if (colH && Array.isArray(colHoraire)) {
                    colHoraire.forEach(item => {
                        //calcul du temps 
                        const start = new Date(item.startTime);
                        const end = new Date(item.endTime);

                        const diffMs = end.getTime() - start.getTime(); //en milisecondes
                        let totalHours = diffMs / (1000 * 60 * 60); //heures
                        totalHours -= item.lunchTimeInMinutes / 60;
                        totalHours = Math.round(totalHours * 100) / 100; //avec 2 decimal

                        // Calcul cout total
                        const total = Math.round(totalHours * item.hourlyRate * 100) / 100;
                        totalFacture += total;

                        // Ajout des variables a l'Array
                        item.totalHours = totalHours;
                        item.total = total;
                    });
                }


                if (colU && Array.isArray(colUnitaires)) {
                    colUnitaires.forEach(item => {
                        const quantity = Number(item.quantity) || 0;
                        const pricePerUnit = Number(item.pricePerUnit) || 0;

                        const total = Math.round(quantity * pricePerUnit * 100) / 100;
                        item.total = total;
                        totalFacture += total;
                    });
                }

                //1.2 Appliquer les taxes
                const taxesArray = await getTaxesArrayForFacture(factureId);
                let totalTaxesAmount = 0;
                if (taxesArray && Array.isArray(taxesArray)) {
                    taxesArray.forEach(tax => {
                        //calcul montant taxe
                        const amount = Math.round((totalFacture * tax.rate / 100) * 100) / 100;
                        totalTaxesAmount += amount;
                    });
                }

                invoiceInfos = {
                    "date": new Date(factureData.facture.dateFacture).toLocaleDateString(),
                    "factureNumber": factureData.facture.factureNumber,
                    "colonnesHoraire": colHoraire,
                    "colonnesUnitaires": colUnitaires,
                    "sousTotal": totalFacture,
                    "taxes": taxesArray,
                    "taxesNumbers": taxesnumbers,
                    "total": totalFacture + totalTaxesAmount
                }
            }

            facture = {
                user: userInfos,
                client: clientInfos,
                facture: invoiceInfos,
            }

            console.log('=== Preview Data Debug ===');
            console.log('userInfos:', userInfos);
            console.log('clientInfos:', clientInfos);
            console.log('invoiceInfos:', invoiceInfos);
            console.log('facture object:', facture);
        }

        // Check if all required data is present
        if (!facture || !facture.user || !facture.client || !facture.facture) {
            console.error('Missing required data:', {
                hasFacture: !!facture,
                hasUser: !!facture?.user,
                hasClient: !!facture?.client,
                hasInvoice: !!facture?.facture
            });
            return new Response(
                JSON.stringify({ 
                    error: 'Incomplete invoice data',
                    details: {
                        hasUser: !!facture?.user,
                        hasClient: !!facture?.client,
                        hasInvoice: !!facture?.facture
                    }
                }), 
                { status: 500 }
            );
        }

        //ceci represente un schema de donnees sur lequel se baser pour creer les tableaux
        // let infoArrayInvoice = {
        //     "date": "2024-01-01",
        //     "time": "12:00",
        //     "factureNumber": "2024-001",
        //     "colonnesHoraire": [{"workPosition": "Développeur",
        //                         "hourlyRate": 50,
        //                         "startTime": "2024-01-01T09:00",
        //                         "endTime": "2024-01-01T12:00",
        //                         "lunchBreak": 30,
        //                         "totalHours": 2.5,
        //                         "total": 125.00},
        //                         {"workPosition": "Designer",
        //                         "hourlyRate": 60,
        //                         "startTime": "2024-01-02T10:00",
        //                         "endTime": "2024-01-02T13:00",
        //                         "lunchBreak": 0,
        //                         "totalHours": 3,
        //                         "total": 180.00}],
        //     "colonnesUnitaires": [
        //         {"productName": "Service de consultation",
        //         "description": "Consultation en développement web",
        //         "quantity": 2,
        //         "pricePerUnit": 100.00,
        //         "total": 200.00,
        //         "productPhoto": "./favicon.ico"
        //         },
        //         {"productName": "Licence de logiciel",
        //         "description": "Licence annuelle pour le logiciel X",
        //         "quantity": 1,
        //         "pricePerUnit": 300.00,
        //         "total": 300.00,
        //         "productPhoto": "./favicon.ico"}],
        //     "sousTotal": 805.00,
        //     "taxes": [{"name": "TPS", "rate": 5, "amount": 40.25},
        //             {"name": "TVQ", "rate": 9.975, "amount": 80.36}],
        //     "total": 925.61
        // };

        console.log(facture?.client);
        console.log(facture?.user);
        console.log(facture?.facture);

        return Response.json(facture);
    } catch (error) {
        console.error('Error fetching facture data:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch facture data' }), { status: 500 });
    }
}
