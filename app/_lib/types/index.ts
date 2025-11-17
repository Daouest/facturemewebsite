/**
 * Type definitions index
 * Re-exports all types for convenient importing
 */

// Invoice types
export type {
  Facture,
  ItemFacture,
  TauxHoraireFacture,
  TableFactureType,
  InvoiceForm,
  InvoiceFormItem,
  FactureUnitaire,
  FactureHoraire,
} from "./invoice-types";

// User types
export type {
  UserData,
  Client,
  ClientAffichage,
  ClientForm,
  CustomerField,
  Business,
  BusinessField,
  Address,
  Ticket,
} from "./user-types";

// Item types
export type {
  ItemData,
  Objet,
  TauxHoraire,
  ItemTable,
  TableItemType,
  HourlyRateType,
  ItemField,
  ItemFieldWithPrice,
  ItemIdentifier,
  ObjectField,
} from "./item-types";
