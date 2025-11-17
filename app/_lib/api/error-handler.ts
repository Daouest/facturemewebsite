import { NextResponse } from "next/server";
/** * Generic error handler wrapper for API routes * Catches errors, logs them, and returns a standardized error response *  * @param handler - The async function to execute * @param errorMessage - Custom error message for the response * @returns NextResponse with success or error *  * @example * export async function GET(req: NextRequest) { *   return withErrorHandling(async () => { *     // Your route logic here *     return NextResponse.json({ data: "success" }); *   }, "Failed to fetch data"); * } */ export async function withErrorHandling<
  T = any,
>(
  handler: () => Promise<NextResponse>,
  errorMessage: string = "Server error",
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    console.error(errorMessage, error);
    return NextResponse.json({ error: errorMessage } as any, { status: 500 });
  }
}
/** * Error handler specifically for duplicate key errors (MongoDB E11000) * Used primarily in auth/signup routes *  * @param error - The error object from MongoDB * @returns NextResponse if it's a duplicate key error, null otherwise */ export function handleDuplicateKeyError(
  error: any,
): NextResponse | null {
  if (error?.code === 11000 && error?.keyPattern) {
    const errors: Record<string, string> = {};
    if (error.keyPattern.email) errors.email = "Email déjà utilisé";
    if (error.keyPattern.username) errors.username = "Username déjà utilisé";
    return NextResponse.json(
      { message: "Conflit: identifiant déjà pris", errors },
      { status: 409 },
    );
  }
  return null;
}
