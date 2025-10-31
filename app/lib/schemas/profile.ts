import { z } from "zod"

////////////////////////////////////////////////////////////
//le schema du profile
////////////////////////////////////////////////////////////

export const ProfileSchema = z.object({
    username: z.string().min(2, "Too short").max(20),
    email: z.string().email("Invalid email"),
    firstName: z.string().min(1, "Required").max(20),
    lastName: z.string().min(1, "Required").max(20),
}).strict()

export type ProfileInput = z.infer<typeof ProfileSchema>

////////////////////////////////////////////////////////////
//le schema du password
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
}).strict()

export type PasswordInput = z.infer<typeof PasswordSchema>