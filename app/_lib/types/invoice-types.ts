/** * Invoice-related type definitions * Extracted from definitions.ts for better organization */ export type Facture =
  {
    idFacture: number;
    idUser: number;
    dateFacture: Date;
    typeFacture: "U" | "H" | "P";
    factureNumber: number;
    includesTaxes: boolean;
    isActive: boolean;
    isPaid: boolean;
    isBusinessInvoice: boolean;
    idClient: number;
    idBusiness?: number;
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
export type TableFactureType = {
  idFacture: number;
  idUser: number;
  dateFacture: Date;
  typeFacture: "U" | "H" | "P";
  factureNumber: number;
  isPaid: boolean;
  idClient: number;
  nomClient: string;
};

export type InvoiceForm = {
  customerId: string;
  businessId: string;
  invoiceType: "company" | "personal";
  dateType: "current" | "future";
  invoiceDate: string;
  numberType: "auto" | "custom";
  number: string;
  items: InvoiceFormItem[];
};
export type InvoiceFormItem = { id: number; type: "product" | "hourly" } & (
  | { type: "product"; quantity: number }
  | { type: "hourly"; breakTime: number; startTime: string; endTime: string }
);
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
