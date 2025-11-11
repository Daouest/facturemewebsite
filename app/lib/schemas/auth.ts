import { z } from "zod"

/////////////////////////////////////////////////////////
//les schemas de validations
//////////////////////////////////////////////////////////

export const EmailAddress = z.string().trim().toLowerCase().pipe(z.email())

export const SendConfirmationBody = z.object({
    uid: z.string().min(1),
    email: EmailAddress,
}).strict()

export const ConfirmQuery = z.object({
    token: z.string().min(1),
}).strict()

//////////////////////////////////////////////////////////
//le schema d'addresse
//////////////////////////////////////////////////////////

export const AddressSchema = z.object({
    address: z.string().min(1, "L'adresse est requise").max(255),
    city: z.string().min(1, "La ville est requise").max(100),
    province: z.string().min(2, "La province est requise").max(3),
    zipCode: z.string()
        .min(1, "Le code postal est requis")
        .regex(/^[A-Za-z0-9\s-]+$/, "Le code postal doit contenir seulement des lettres, chiffres, espaces ou tirets")
        .max(10),
    country: z.string().min(2, "Le pays est requis").max(2),
})

//////////////////////////////////////////////////////////
//le schema de signup
//////////////////////////////////////////////////////////

export const SignupSchema = z.object({
    username: z.string().min(1).max(15),
    firstName: z.string().min(1).max(15),
    lastName: z.string().min(1).max(15),
    email: z.email(),
    password: z.string().min(8),
    address: AddressSchema,
})

////////////////////////////////////////////////////////////
//le schema de login
////////////////////////////////////////////////////////////

export const LoginSchema = z.object({
    email: z.email(),
    password: z.string().min(1)
})