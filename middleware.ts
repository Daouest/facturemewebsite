// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!auth|api|_next/static|_next/image|favicon.ico).*)"],
};
