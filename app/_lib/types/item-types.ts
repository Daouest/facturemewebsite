/**
 * Item and product-related type definitions
 * Extracted from definitions.ts for better organization
 */
export type ItemData = {
  itemNom: string;
  description: string;
  prix: number;
  image?: string;
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

export type TableItemType = {
  idObjet: number;
  productName: string;
  description: string;
  price: number;
  productPhoto: string;
  idFacture: number;
};

export type HourlyRateType = {
  idObjet: number;
  idUser: number;
  clientName: string;
  workPosition: string;
  hourlyRate: number;
  //things to implement later:
  //idParent
  //enforcementDate
};

export type ItemField = {
  id: number;
  name: string;
  type: "product" | "hourly";
};

export type ItemFieldWithPrice = ItemField &
  (
    | {
        type: "product";
        price: number;
      }
    | {
        type: "hourly";
        hourlyRate: number;
      }
  );

export type ItemIdentifier = {
  id: number;
  type: "product" | "hourly";
};

export type ObjectField = {
  id: number;
  name: string;
};
