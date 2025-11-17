import { NextRequest, NextResponse } from "next/server";
/** * Check if cache is valid by count header * @param req - The NextRequest object * @param currentCount - The current count of items * @returns Object with shouldReturn304 and count string */ export function checkCacheByCount(
  req: NextRequest,
  currentCount: number,
): { shouldReturn304: boolean; count: string } {
  const count = currentCount.toString();
  const clientCount = req.headers.get("if-count-change");
  return { shouldReturn304: clientCount === count, count };
}
/** * Check if cache is valid by ETag * @param req - The NextRequest object * @param etagValue - The current ETag value * @returns True if cache is valid (should return 304) */ export function checkCacheByETag(
  req: NextRequest,
  etagValue: string,
): boolean {
  const clientEtag = req.headers.get("if-None-Match");
  return clientEtag === etagValue;
}
/** * Set cache control headers on response * @param response - The NextResponse object * @param headers - Object with optional count and etag values * @returns The modified response */ export function setCacheHeaders(
  response: NextResponse,
  headers: { count?: string; etag?: string },
): NextResponse {
  if (headers.count) response.headers.set("Count", headers.count);
  if (headers.etag) response.headers.set("Etag", headers.etag);
  return response;
}
/** * Return 304 Not Modified response */ export function notModifiedResponse(): NextResponse {
  return new NextResponse(null, { status: 304 });
}
