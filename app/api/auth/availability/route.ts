import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/_lib/database/mongodb";
import { DbUsers } from "@/app/_lib/database/models";
import mongoose from "mongoose";

export const runtime = "nodejs";

//ici en gros on check la db pour voir si les valeurs existent déjà
// lors de la création d'un nouveau user
export async function GET(req: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.trim();
  const username = searchParams.get("username")?.trim();

  if (!email && !username) {
    return NextResponse.json(
      { message: "email or username required" },
      { status: 400 },
    );
  }

  const query: any[] = [];
  if (email) query.push({ email });
  if (username) query.push({ username });

  const exists = await DbUsers.exists({ $or: query });
  const taken: Record<string, boolean> = { email: false, username: false };

  if (exists) {
    // Find which one(s) are taken (cheap second query; still fast)
    const hits = await DbUsers.find({ $or: query })
      .select("email username")
      .lean();
    for (const h of hits) {
      if (email && h.email?.toLowerCase() === email.toLowerCase())
        taken.email = true;
      if (username && h.username?.toLowerCase() === username.toLowerCase())
        taken.username = true;
    }
  }

  return NextResponse.json({ taken });
}
