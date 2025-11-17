import { z } from "zod";

//////////////////////////////////////////////////////////////
// le schema du profile
////////////////////////////////////////////////////////////

export const ProfileSchema = z.object({
  username: z.string().min(2, "Too short").max(20),
  email: z.string().email("Invalid email"),
  firstName: z.string().min(1, "Required").max(20),
  lastName: z.string().min(1, "Required").max(20),
}).strict();

export type ProfileInput = z.infer<typeof ProfileSchema>;

//////////////////////////////////////////////////////////////
// le schema du password
////////////////////////////////////////////////////////////

export const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Za-z]/, "Doit contenir une lettre")
    .regex(/\d/, "Doit contenir un chiffre"),
  confirmNewPassword: z.string().min(1, "Requis"),
}).refine((v) => v.newPassword === v.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
}).strict();

export type PasswordInput = z.infer<typeof PasswordSchema>;

//////////////////////////////////////////////////////////////
// le schema du business
////////////////////////////////////////////////////////////

export const BusinessSchema = z.object({
  //basic infos
  idBusiness: z.number().int().optional(),
  name: z.string().min(2, "Trop court").max(30),
  businessNumber: z.string()
    .length(9, "Le numéro doit être de 9 chiffres")
    .regex(/^\d+$/, "Ne doit contenir que des chiffres."),
  //addresse
  idAddress: z.number().int().optional(),
  address: z.string()
    .min(8, "L'addresse doit être complète.")
    .regex(/\d/, "Doit inclure le numéro civique.")
    .regex(/[A-Za-z]/, "Doit inclure le nom de la rue."),
  city: z.string()
    .min(3, "Entrez le nom complet."),
  zipCode: z.string().min(6).max(6)
    .regex(/^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/, "Code postal non valide."),
  province: z.string().min(2).max(3), //Sous forme: "QC", "ON", "PE", etc.
  country: z.string().length(2), //Seulement "CA" pour le moment
  //logo (optionnel)
  logo: z.string().optional(),
  //taxes (optionnel)
  TVP: z.string().length(9, "Le numéro doit être de 9 chiffres").optional(),
  TVQ: z.string().length(9, "Le numéro doit être de 9 chiffres").optional(),
  TVH: z.string().length(9, "Le numéro doit être de 9 chiffres").optional(),
  TVS: z.string().length(9, "Le numéro doit être de 9 chiffres").optional()
}).strict();

export type BusinessInput = z.infer<typeof BusinessSchema>;

