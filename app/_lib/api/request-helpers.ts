import { NextResponse } from "next/server";
import { z } from "zod";
/** * Parse JSON from request with optional Zod schema validation * @param req - The Request object * @param schema - Optional Zod schema for validation * @returns Success with data or failure with response */ export async function parseJSON<
  T,
>(
  req: Request,
  schema?: z.ZodSchema<T>,
): Promise<
  { success: true; data: T } | { success: false; response: NextResponse }
> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json({ message: "Invalid JSON" }, { status: 400 }),
    };
  }
  if (schema) {
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const err of parsed.error.issues) {
        errors[err.path.join(".")] = err.message;
      }
      return {
        success: false,
        response: NextResponse.json(
          { message: "Validation error", errors },
          { status: 400 },
        ),
      };
    }
    return { success: true, data: parsed.data };
  }
  return { success: true, data: body };
}
/** * Parse JSON with try-catch wrapper * Can optionally validate with Zod schema * @param req - The Request object * @param schema - Optional Zod schema for validation * @returns Parsed body or error response */ export async function safeParseJSON<
  T = any,
>(
  req: Request,
  schema?: z.ZodSchema<T>,
): Promise<
  { success: true; data: T } | { success: false; response: NextResponse }
> {
  try {
    const body = await req.json();
    if (schema) {
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        const errors: Record<string, string> = {};
        for (const err of parsed.error.issues) {
          errors[err.path.join(".")] = err.message;
        }
        return {
          success: false,
          response: NextResponse.json(
            { message: "Validation error", errors },
            { status: 400 },
          ),
        };
      }
      return { success: true, data: parsed.data };
    }
    return { success: true, data: body };
  } catch {
    return {
      success: false,
      response: NextResponse.json({ message: "Invalid JSON" }, { status: 400 }),
    };
  }
}
