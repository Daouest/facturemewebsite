import { getSession } from "./session";

//on force l'utilisateur à avoir un accès avant d'acceder aux pages
//si ya pas de session, on lance une erreur
//c'est avec le middleware qu'on va redirect par la suite
export async function requireAuth() {
    const session = await getSession()
    if (!session) {
        throw Object.assign(new Error("Unauthorized"), { status: 401 })
    }
    return session?.user

}