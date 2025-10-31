import { NextResponse } from "next/server";
import { getImageItem } from "@/app/lib/data";

export async function GET( req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 
  const productPhoto = await getImageItem(parseInt(id, 10));

  if (!productPhoto) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  return NextResponse.json({ image: productPhoto });
}

