export type Facture = {
    idFacture: number;
    idUser: number;
    dateFacture: Date;
    typeFacture: 'U' | 'H' | 'P';
    factureNumber: number;
    includesTaxes: boolean;
    isActive: boolean;
    isPaid: boolean;
    isBusinessInvoice: boolean;
    idClient: number;
    nomClient: string;
};

export type ItemFacture = {
    idFacture: number;
    idColumn: number;
    productName: string;
    description: string;
    quantity: number;
    pricePerUnit: number;
    productPhoto: string;
};

export type TauxHoraireFacture = {
    idFacture: number;
    idColumn: number;
    workPosition: string;
    hourlyRate: number;
    workingDate: Date;
    startTime: Date;
    endTime: Date;
    lunchTimeInMinutes: number;
};

export type ItemData = {
    itemNom: string;
    description: string;
    prix: number;
    image?: string;
};

export type UserData = {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    idAddress?: number;
    idBusiness?: number;
    isOnline?: boolean;
    isAdmin?: boolean;
};

export type Objet = {
    idObjet: number;
    idUser: number;
    productName: string;
    description: string;
    price: number;
    productPhoto: string;
    enforcementDate: Date;
    idParent: number | null;
};

export type TauxHoraire = {
    idObjet: number;
    idUser: number;
    clientName: string;
    workPosition: string;
    hourlyRate: number;
    enforcementDate: Date;
    idParent: number | null;
};

export type ItemTable = (Objet | TauxHoraire)[];

export type TableFactureType = {
    idFacture: number,
    idUser: number,
    dateFacture: Date,
    typeFacture: 'U' | 'H' | 'P';
    factureNumber: number,
    isPaid: boolean,
    idClient: number,
    nomClient: string
}

export type Client = {
    idClient: number,
    idUser: number,
    nomClient: string,
    idAddress: number,
    isOnline?:boolean,
}

export type ClientAffichage = {
    idClient: number,
    nomClient: string,
    address: Address
}
export type Ticket = {
    idClient: number;
    message: string;
    isCompleted:string;
    nomClient:string;
    date: Date;
    idTicket:number,
};
export type TableItemType = {
    idObjet: number,
    productName: string;
    description: string;
    price: number;
    productPhoto: string;
    idFacture: number;
}

export type HourlyRateType = {
    idObjet: number,
    idUser: number,
    clientName: string,
    workPosition: string,
    hourlyRate: number,

    //things to implement later:
    //idParent
    //enforcementDate
}

export type CustomerField = {
    id: number;
    name: string;
};

export type ItemField = {
    id: number;
    name: string;
    type: 'product' | 'hourly';
};

// Extended type with pricing information for invoice calculations
export type ItemFieldWithPrice = ItemField & (
    | {
        type: 'product';
        price: number;
    }
    | {
        type: 'hourly';
        hourlyRate: number;
    }
);

export type BusinessField = {
    id: number;
    name: string;
};

export type InvoiceForm = {
    customerId: string;
    businessId: string;
    numberType: 'auto' | 'custom';
    number: string;
    items: InvoiceFormItem[];
};

// Updated to properly distinguish between product and hourly items
export type InvoiceFormItem = {
    id: number;
    type: 'product' | 'hourly';
} & (
        | {
            type: 'product';
            quantity: number;
        }
        | {
            type: 'hourly';
            breakTime: number;
            startTime: string;
            endTime: string;
        }
    );

// Add a helper type for unique identification
export type ItemIdentifier = {
    id: number;
    type: 'product' | 'hourly';
};

export type ObjectField = {
    id: number;
    name: string;
};

export type FactureUnitaire = {
    idFacture: number;
    idColumn: number;
    productName: string;
    description: string;
    quantity: number;
    pricePerUnit: number;
    productPhoto: string;
};

export type FactureHoraire = {
    idFacture: number;
    idColumn: number;
    workPosition: string;
    hourlyRate: number;
    workDate: Date;
    startTime: Date;
    endTime: Date;
    lunchTimeInMinutes: number;
};

export type Business = {
    idBusiness: number,
    businessName: string,
    businessLogo: string,
    idAddress: number,
    businessNumber: string,
    TVSnumber: string,
    TVQnumber: string,
    TVPnumber: string,
    TVHnumber: string
}

export type Address = {
    idAddress: number,
    address: string,
    province: string,
    zipCode: string,
    country: string
    city: string
}

export type ClientForm = {
    idClient: number,
    idUser: number,
    clientName: string,
    clientAddress: Address
}
