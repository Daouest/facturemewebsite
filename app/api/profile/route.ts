import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/app/lib/session/session-node";
import { connectToDatabase } from "@/app/lib/db/mongodb";
import { DbUsers } from "@/app/lib/models";

//lecture du data qui est retourné par Mongoose
function toPublic(u: any) {
    return {
        idUser: u.idUser,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        //utile pour garder en valeur dans le ETag
        //si jamais le user est connécté dans plusieurs sessions en même temps
        __v: u.__v,
    };
}

export async function GET(_req: NextRequest) {
    const userFromCookie = await getUserFromCookies();
    //mauvais user
    if (!userFromCookie) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    //recherche par id dans la bd
    //l'utilisation de "lean()" c'est pour rendre le tout plus rapide
    //source : https://mongoosejs.com/docs/tutorials/lean.html
    const u = await DbUsers.findOne({ idUser: userFromCookie.idUser }).lean();
    //mauvais idUser
    if (!u) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    //on remet "u" sous le bon format de la DB
    const res = NextResponse.json(toPublic(u), { status: 200 });
    //on set le ETag pour sécuriser les modifs
    res.headers.set("ETag", `"${u.__v ?? 0}"`);
    return res;
}

export async function PUT(req: NextRequest) {
    const userFromCookie = await getUserFromCookies()
    if (!userFromCookie) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    //on get une information par le "name" pour la comparer par la suite
    //source : https://fetch.spec.whatwg.org/#header-name
    //source : https://developer.mozilla.org/en-US/docs/Web/API/Headers/get
    const ifMatch = req.headers.get("if-match") || undefined

    if (!ifMatch) {
        //erreur 412 c'est pour le etag
        return NextResponse.json({ message: "Erreur dans le etag" }, { status: 412 })
    }

    const objVersion = Number(ifMatch?.replace(/"/g, "").trim())

    if (!Number.isFinite(objVersion)) {
        return NextResponse.json({ message: "Invalid Etag" }, { status: 400 })
    }

    let body: any;
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
    }

    //on fait les changements dans la bd
    const { firstName, lastName, email, username } = body ?? {};
    const setFields: Record<string, any> = {}
    if (typeof firstName === "string") setFields.firstName = firstName;
    if (typeof lastName === "string") setFields.lastName = lastName;
    if (typeof email === "string") setFields.email = email;
    if (typeof username === "string") setFields.username = username;


    if (Object.keys(setFields).length == 0) {
        return NextResponse.json({ message: "rien a changer" }, { status: 400 })
    }

    await connectToDatabase()

    //si le username est deja dans la bd
    if (typeof username == "string") {
        const usernameExists = await DbUsers.exists({ username, idUser: { $ne: userFromCookie.idUser } })

        if (usernameExists) {
            return NextResponse.json({ message: "username existe déjà" }, { status: 409 })
        }
    }
    //si le email est deja dans la bd
    if (typeof email == "string") {
        const emailExists = await DbUsers.exists({ email, idUser: { $ne: userFromCookie.idUser } })

        if (emailExists) {
            return NextResponse.json({ message: "email existe déjà" }, { status: 409 })
        }
    }

    //modification dans la db et on incremente aussi la __v
    const updated = await DbUsers.findOneAndUpdate(
        { idUser: userFromCookie.idUser, __v: objVersion },
        { $set: setFields, $inc: { __v: 1 } },
        { new: true }
    )

    if (!updated) {
        return NextResponse.json({ message: "erreur dans le ETag" }, { status: 412 })
    }

    const pub = toPublic(updated)
    const res = NextResponse.json(pub, { status: 200 })
    res.headers.set("ETag", `"${updated.__v ?? 0}`)
    return res
}