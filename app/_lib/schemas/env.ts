import "server-only";
import { z } from "zod";

// only base vars are strict at import time
const BaseSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  // Mongo are OPTIONAL here to avoid build-time throws
  MONGODB_URI: z.string().optional(),
  MONGODB_DB_NAME: z.string().optional(),
  // Gmail optional too; validate only when sending email
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REFRESH_TOKEN: z.string().optional(),
  GMAIL_REDIRECT_URI: z.string().optional(),
  GMAIL_SENDER: z.string().optional(),
});

type Env = z.infer<typeof BaseSchema>;
let _env: Env | null = null;

export function getServerEnv(): Env {
  if (_env) return _env;
  _env = BaseSchema.parse(process.env); // safe: no Mongo requirement here
  return _env;
}

export function requireMongoEnv() {
  const e = getServerEnv();
  const missing: string[] = [];
  if (!e.MONGODB_URI) missing.push("MONGODB_URI");
  if (!e.MONGODB_DB_NAME) missing.push("MONGODB_DB_NAME");
  if (missing.length)
    throw new Error(`Mongo not configured: ${missing.join(", ")}`);
  return {
    MONGODB_URI: e.MONGODB_URI!,
    MONGODB_DB_NAME: e.MONGODB_DB_NAME!,
    NODE_ENV: e.NODE_ENV,
  };
}

export function requireGmailEnv() {
  const e = getServerEnv();
  const missing: string[] = [];
  if (!e.GMAIL_CLIENT_ID) missing.push("GMAIL_CLIENT_ID");
  if (!e.GMAIL_CLIENT_SECRET) missing.push("GMAIL_CLIENT_SECRET");
  if (!e.GMAIL_REFRESH_TOKEN) missing.push("GMAIL_REFRESH_TOKEN");
  if (!e.GMAIL_REDIRECT_URI) missing.push("GMAIL_REDIRECT_URI");
  if (!e.GMAIL_SENDER) missing.push("GMAIL_SENDER");
  if (missing.length)
    throw new Error(`Email not configured: ${missing.join(", ")}`);
  return {
    GMAIL_CLIENT_ID: e.GMAIL_CLIENT_ID!,
    GMAIL_CLIENT_SECRET: e.GMAIL_CLIENT_SECRET!,
    GMAIL_REFRESH_TOKEN: e.GMAIL_REFRESH_TOKEN!,
    GMAIL_REDIRECT_URI: e.GMAIL_REDIRECT_URI!,
    GMAIL_SENDER: e.GMAIL_SENDER!,
  };
}

export const APP_URL =
  getServerEnv().NEXT_PUBLIC_APP_URL ??
  (getServerEnv().VERCEL_URL
    ? `https://${getServerEnv().VERCEL_URL}`
    : "http://localhost:3000");
