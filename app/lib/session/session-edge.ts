import {
    encrypt,
    decrypt,
    COOKIE_NAME,
    ACCESS_TTL_MS,
    type SessionPayload,
} from "./session-crypto";

export { COOKIE_NAME, ACCESS_TTL_MS };
export type { SessionPayload };

// Verify a token and return the typed payload (or null)
export async function verifyToken(token: string) {
    return await decrypt<SessionPayload>(token);
}

// Create a refreshed token from an existing payload
export async function refreshToken(payload: SessionPayload) {
    return await encrypt(payload);
}
