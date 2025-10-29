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
//le schema de signup
//////////////////////////////////////////////////////////

export const SignupSchema = z.object({
    username: z.string().min(1).max(15),
    firstName: z.string().min(1).max(15),
    lastName: z.string().min(1).max(15),
    email: z.email(),
    password: z.string().min(8),
})

////////////////////////////////////////////////////////////
//le schema de login
////////////////////////////////////////////////////////////

export const LoginSchema = z.object({
    email: z.email(),
    password: z.string().min(1)
})