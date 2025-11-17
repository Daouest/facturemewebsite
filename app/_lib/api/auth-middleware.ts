import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/app/_lib/session/session-node";
import type { SessionPayload } from "@/app/_lib/session/session-crypto";
/** * Authentication middleware wrapper for API routes * Validates user session and returns 401 if not authenticated *  * @param handler - Function that receives authenticated user and request * @param req - The incoming NextRequest * @returns NextResponse from handler or 401 Unauthorized *  * @example * export async function GET(req: NextRequest) { *   return withAuth(async (user) => { *     // user is guaranteed to be authenticated here *     return NextResponse.json({ idUser: user.idUser }); *   }, req); * } */ export async function withAuth<
  T = any,
>(
  handler: (user: SessionPayload, req: NextRequest) => Promise<NextResponse>,
  req: NextRequest,
): Promise<NextResponse> {
  const user = await getUserFromCookies();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" } as any, {
      status: 401,
    });
  }
  return handler(user, req);
}
/** * Check if user is authenticated without wrapping the entire handler * Useful when you need conditional auth logic *  * @returns User session or null if not authenticated */ export async function getAuthenticatedUser(): Promise<SessionPayload | null> {
  return await getUserFromCookies();
}
/** * Returns 401 response for unauthorized requests * Useful for consistent error responses */ export function unauthorized(
  message: string = "Unauthorized",
): NextResponse {
  return NextResponse.json({ message }, { status: 401 });
}
