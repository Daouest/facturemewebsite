import crypto from "node:crypto"

//Façon de générer un hash de 256-bit unique afin de l'encrypter.
//Dans ce context, on l'utilise pour créer un code unique lors de l'envoi
//de confirmation de email.
//Source : https://nodejs.org/api/crypto.html

//Cette function prend en valeur un nombre x de minutes afin de mettre une limite
//d'usage pour le lien qui sera crée avec l'aide de crypto
export function createEmailToken(minutes = 30){
    const token = crypto.randomBytes(32).toString("hex")
    const hash = crypto.createHash("sha256").update(token).digest("hex")
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000)

    return { token, hash, expiresAt }
}


//creation du hash token à partir du string qu'on lui fournit
export function hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex")
}