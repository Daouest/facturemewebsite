/**
 * User and client-related type definitions
 * Extracted from definitions.ts for better organization
 */
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

export type Client = {
  idClient: number;
  idUser: number;
  nomClient: string;
  idAddress: number;
  isOnline?: boolean;
};

export type ClientAffichage = {
  idClient: number;
  nomClient: string;
  address: Address;
};

export type ClientForm = {
  idClient: number;
  idUser: number;
  clientName: string;
  clientAddress: Address;
};

export type CustomerField = {
  id: number;
  name: string;
};

export type Business = {
  idBusiness: number;
  businessName: string;
  businessLogo: string;
  idAddress: number;
  businessNumber: string;
  TVSnumber: string;
  TVQnumber: string;
  TVPnumber: string;
  TVHnumber: string;
};

export type BusinessField = {
  id: number;
  name: string;
};

export type Address = {
  idAddress: number;
  address: string;
  province: string;
  zipCode: string;
  country: string;
  city: string;
};

export type Ticket = {
  idClient: number;
  message: string;
  isCompleted: string;
  nomClient: string;
  date: Date;
  idTicket: number;
};
