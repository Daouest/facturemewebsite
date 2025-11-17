import { NextResponse, NextRequest } from "next/server";
import {
  insertItem,
  updateItem,
  getUserInfoByEmail,
  deleteItemsById,
} from "@/app/_lib/database/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    body.prix = parseInt(body.prix);
    const userData = body.userData;

    const itemData = body.formData;
    const idUser = await getUserInfoByEmail(userData.email);
    if (!userData.id) userData.id = idUser;
    // console.log("Données reçues", userData, itemData);
    const result = await insertItem(userData, itemData);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erreur dans GET /api/creation-item :", error);

    return NextResponse.json(
      { error: "Impossible d'insérer l'utilisateur" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    body.prix = parseInt(body.prix);
    const userData = body.userData;

    const itemData = body.formData;
    const idUser = await getUserInfoByEmail(userData.email);
    if (!userData.id) userData.id = idUser;

    // console.log("Données PUT reçues", userData, itemData);
    const result = await updateItem(userData, itemData);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erreur dans PUT /api/item :", error);

    return NextResponse.json(
      { error: "Impossible de modifier l'utilisateur" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    body.prix = parseInt(body.prix);
    const userData = body.userData;

    const itemData = body.formData;
    const idUser = await getUserInfoByEmail(userData.email);
    if (!userData.id) userData.id = idUser;

    const result = await deleteItemsById(itemData, userData.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Erreur dans DELETE /api/item :", error);

    return NextResponse.json(
      { error: "Impossible de supprimer l'utilisateur" },
      { status: 500 },
    );
  }
}
