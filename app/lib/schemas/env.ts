///////////////////////////////////////////////////////////
//le schema des variables d'environnement du serveur
////////////////////////////////////////////////////////////

import "server-only"
import { z } from "zod"

const ServerEnvSchema = z.object({
    //Mongo
    MONGODB_URI: z.string(),
    MONGODB_DB_NAME: z.string().min(1),

    //Gmail API (OAuth2)
    GMAIL_CLIENT_ID: z.string().min(1),
    GMAIL_CLIENT_SECRET: z.string().min(1),
    GMAIL_REFRESH_TOKEN: z.string().min(1),
    GMAIL_REDIRECT_URI: z.string().default("http://localhost"),
    GMAIL_SENDER: z.string().min(1),

    //Public urls
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    VERCEL_URL: z.string().optional(),  //à chequer

    //environnement de travail
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
})

const env = ServerEnvSchema.parse(process.env)

export const APP_URL = env.NEXT_PUBLIC_APP_URL ??
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000");

export { env }