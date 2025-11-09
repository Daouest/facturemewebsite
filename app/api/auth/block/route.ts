import { NextRequest } from "next/server";
import { setCookieBlock } from "@/app/lib/session/session-node" // ton fichier partagé

export async function POST(req: NextRequest) {
  const { blockUser } = await req.json();
  console.log("blockuser",blockUser)
  return await setCookieBlock(blockUser);
}
