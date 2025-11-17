import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/app/_lib/session/session-node";
import { connectToDatabase } from "@/app/_lib/database/mongodb";
import { DbAddress, DbBusiness, DbUsers } from "@/app/_lib/database/models";
import {
  fetchBusinessInfoByUserId,
  getAddressInfo,
  fetchNextAddressId,
  fetchNextBusinessId,
} from "@/app/_lib/database/queries";

//lecture du data qui est retourné par Mongoose
function toPublic(bizz: any, address: any) {
  return {
    //basics
    idBusiness: bizz.idBusiness,
    name: bizz.businessName,
    businessNumber: bizz.businessNumber,

    //address
    idAddress: bizz.idAddress,
    address: address.address,
    city: address.city,
    zipCode: address.zipCode,
    province: address.province,
    country: address.country,

    //optionnal
    logo: bizz.businessLogo,
    TVP: bizz.TVPnumber,
    TVQ: bizz.TVQnumber,
    TVH: bizz.TVHnumber,
    TVS: bizz.TVSnumber,
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

  //on va fetch les infos de la business
  const bizz = await fetchBusinessInfoByUserId(userFromCookie.idUser);
  if (!bizz.businessInfo) {
    //il est possible qu'un utilisateur n'ait pas encore inscrit son business
    return NextResponse.json(
      { message: "Business not found" },
      { status: 200 },
    );
  }

  const address = await getAddressInfo(bizz.businessInfo.idAddress);
  if (!address.addressData) {
    //il est possible qu'un utilisateur n'ait pas encore inscrit son business
    return NextResponse.json(
      { message: "Business address not found" },
      { status: 200 },
    );
  }

  //on remet les informations sous le format BusinessSchema
  const res = NextResponse.json(
    toPublic(bizz.businessInfo, address.addressData),
    { status: 200 },
  );

  //on set le ETag pour sécuriser les modifs
  // res.headers.set("ETag", `"${u.__v ?? 0}"`);
  return res;
}

export async function PUT(req: NextRequest) {
  const userFromCookie = await getUserFromCookies();
  if (!userFromCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  // Ajout du idUser dans le setBusiness
  const idUser = userFromCookie.idUser;

  //on fait les changements dans la bd
  const {
    idBusiness,
    name,
    businessNumber,
    idAddress,
    address,
    city,
    zipCode,
    province,
    country,
    logo,
    TVP,
    TVQ,
    TVH,
    TVS,
  } = body ?? {};

  const setBusiness: Record<string, any> = {};
  const setAddress: Record<string, any> = {};

  //Fields pour Business
  if (typeof name === "string") setBusiness.businessName = name;
  if (typeof businessNumber === "string")
    setBusiness.businessNumber = businessNumber;
  if (typeof logo === "string") setBusiness.businessLogo = logo;
  if (typeof TVP === "string") setBusiness.TVPnumber = TVP;
  if (typeof TVQ === "string") setBusiness.TVQnumber = TVQ;
  if (typeof TVH === "string") setBusiness.TVHnumber = TVH;
  if (typeof TVS === "string") setBusiness.TVSnumber = TVS;
  if (typeof idUser === "number") setBusiness.idUser = idUser;

  if (typeof address === "string") setAddress.address = address;
  if (typeof city === "string") setAddress.city = city;
  if (typeof zipCode === "string") setAddress.zipCode = zipCode;
  if (typeof province === "string") setAddress.province = province;
  if (typeof country === "string") setAddress.country = country;

  // Aucun changement
  if (
    Object.keys(setBusiness).length === 0 &&
    Object.keys(setAddress).length === 0
  ) {
    return NextResponse.json({ message: "Rien à changer" }, { status: 400 });
  }

  await connectToDatabase();

  // Trouver le business pour cet utilisateur (ou par le idBusiness, si il est fournit)
  const existing: any = await DbBusiness.findOne(
    idBusiness ? { idBusiness } : { idUser: idUser },
  ).lean();

  // ADRESSE: Creer ou mettre a jour
  let finalAddressId = idAddress ?? existing.idAddress; // --> presente addresse de la compagnie (l'une ou l'autre)
  if (Object.keys(setAddress).length > 0) {
    if (finalAddressId && finalAddressId != -1) {
      // m.a.j.
      await DbAddress.findOneAndUpdate(
        { idAddress: finalAddressId },
        { $set: setAddress },
      );
    } else {
      // creation d'un nouvel id
      finalAddressId = await fetchNextAddressId();
      // creation d'une addresse dans la BD
      const newAddress = new DbAddress({
        idAddress: finalAddressId,
        ...setAddress,
      });
      await newAddress.save();
    }
    setBusiness.idAddress = finalAddressId;
  }

  // Creer ou on M.A.J. la compagnie
  let updated;

  if (!existing) {
    //Création de la compagnie
    const newBizzId = await fetchNextBusinessId();

    console.log("bizz set: ", setBusiness);
    const newBizz = new DbBusiness({
      idBusiness: newBizzId,
      businessName: setBusiness.businessName,
      businessLogo: setBusiness.businessLogo,
      idAddress: setBusiness.idAddress,
      businessNumber: setBusiness.businessNumber,
      TVSnumber: setBusiness.TVSnumber,
      TVQnumber: setBusiness.TVQnumber,
      TVPnumber: setBusiness.TVPnumber,
      TVHnumber: setBusiness.TVHnumber,
      idUser: idUser,
    });

    console.log("bizz avant save: ", newBizz);
    await newBizz.save();
    updated = newBizz;

    //modify user idBusiness
    const setUser: Record<string, any> = {};
    if (typeof newBizz.idBusiness === "number")
      setUser.idBusiness = newBizz.idBusiness;
    await DbUsers.findOneAndUpdate(
      { idUser: idUser },
      { $set: setUser, $inc: { __v: 1 } },
      { new: true },
    );
  } else {
    //M.A.J. de la compagnie
    updated = await DbBusiness.findOneAndUpdate(
      { idBusiness: existing.idBusiness },
      { $set: setBusiness, $inc: { __v: 1 } },
      { new: true },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { message: "Erreur auprès de la recherche/creation de la compagnie." },
      { status: 404 },
    );
  }

  // fetch address data for response
  const addressRes = await getAddressInfo(updated.idAddress);
  const addressData = addressRes.addressData ?? {
    address: "",
    city: "",
    zipCode: "",
    province: "",
    country: "",
  };

  const pub = toPublic(updated, addressData as any);
  const res = NextResponse.json(pub, { status: 200 });
  return res;
}
