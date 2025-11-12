import { NextResponse, NextRequest } from "next/server";
import { getAllFacturesUsers } from "@/app/lib/data";
import { validateCalendarToken } from "@/app/lib/calendar-token";
import { logCalendarAccess, detectSuspiciousActivity } from "@/app/lib/calendar-audit";
import crypto from "crypto";


// Configuration constants
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_CLEANUP_THRESHOLD = 100; // Clean up after 100 entries
const CACHE_MAX_AGE_SECONDS = 3600; // 1 hour
const ENABLE_RATE_LIMITING = false; // Set to true in production

// Rate limiting: Track last access time per token
const rateLimitMap = new Map<string, number>();

// ETag cache: Store last hash to avoid recalculation
let cachedETag: string | null = null;
let cachedInvoiceData: string | null = null;

// Type definitions for better type safety
interface InvoiceData {
  idFacture: number;
  factureNumber: number;
  dateFacture: string;
  isPaid: boolean;
  updatedAt?: string;
  clientInfo?: {
    nomClient?: string;
  };
}

// Helper function to format date for iCalendar (YYYYMMDDTHHMMSSZ)
function formatICalDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

// Helper to escape special characters in iCalendar format
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Helper to fold long lines (max 75 characters per RFC 5545)
function foldLine(line: string): string[] {
  if (line.length <= 75) return [line];
  
  const lines: string[] = [];
  let currentLine = line.substring(0, 75);
  let remaining = line.substring(75);
  
  lines.push(currentLine);
  
  while (remaining.length > 0) {
    const chunk = remaining.substring(0, 74); // 74 because we add a space
    lines.push(' ' + chunk);
    remaining = remaining.substring(74);
  }
  
  return lines;
}

export async function GET(req: NextRequest) {
  try {
    // Token-based authentication (for calendar subscriptions only)
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response("Authentication required", { status: 401 });
    }

    // Validate token and extract userId
    const userId = validateCalendarToken(token);
    
    if (!userId) {
      logCalendarAccess(0, 'invalid_token', {
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || undefined,
      });
      console.warn('Invalid calendar token attempt');
      return new Response("Authentication failed", { status: 403 });
    }

    // Check for suspicious activity
    if (detectSuspiciousActivity(userId)) {
      console.error(`Suspicious activity detected for user ${userId}`);
      return new Response("Access temporarily restricted", { status: 403 });
    }

    // Log successful access
    logCalendarAccess(userId, 'access', {
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || undefined,
    });

    // Rate limiting check (disabled for testing)
    if (ENABLE_RATE_LIMITING) {
      const now = Date.now();
      const lastAccess = rateLimitMap.get(token);
      
      if (lastAccess && (now - lastAccess) < RATE_LIMIT_WINDOW_MS) {
        const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastAccess)) / 1000);
        logCalendarAccess(userId, 'rate_limited', {
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        });
        return new Response("Too many requests", { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          }
        });
      }
      
      rateLimitMap.set(token, now);
      
      // Clean up old entries periodically
      if (rateLimitMap.size > RATE_LIMIT_CLEANUP_THRESHOLD) {
        const cutoff = now - RATE_LIMIT_WINDOW_MS;
        for (const [key, time] of rateLimitMap.entries()) {
          if (time < cutoff) {
            rateLimitMap.delete(key);
          }
        }
      }
    }

    // Fetch all active invoices
    const invoices = await getAllFacturesUsers(userId, true);

    if (!invoices || invoices.length === 0) {
      return new Response("No data available", { status: 404 });
    }

    // Type cast for better type safety
    const typedInvoices = invoices as unknown as InvoiceData[];

    // Generate hash for ETag based on invoice data
    const invoiceDataString = JSON.stringify(typedInvoices.map(inv => ({
      id: inv.idFacture,
      date: inv.dateFacture,
      paid: inv.isPaid,
      number: inv.factureNumber,
      updated: inv.updatedAt,
    })));
    
    // Check if we have cached ETag and data hasn't changed
    let etag: string;
    if (cachedInvoiceData === invoiceDataString && cachedETag) {
      etag = cachedETag;
    } else {
      const invoiceHash = crypto
        .createHash('md5')
        .update(invoiceDataString)
        .digest('hex');
      etag = `"${invoiceHash}"`;
      cachedETag = etag;
      cachedInvoiceData = invoiceDataString;
    }
    
    // Check if client has cached version
    const clientEtag = req.headers.get('if-none-match');
    if (clientEtag === etag) {
      return new Response(null, { 
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': `max-age=${CACHE_MAX_AGE_SECONDS}`,
        }
      });
    }

    // Generate iCalendar content
    const currentDate = new Date();
    const icsLines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FactureMe//Calendar Export//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:FactureMe Invoices',
      'X-WR-TIMEZONE:UTC',
      'X-WR-CALDESC:Invoice calendar from FactureMe',
      'X-PUBLISHED-TTL:PT1H',
    ];

    // Add each invoice as an event
    typedInvoices.forEach((invoice: InvoiceData) => {
      const invoiceDate = new Date(invoice.dateFacture);
      const eventId = `invoice-${invoice.idFacture}@factureme.com`;
      const clientName = invoice.clientInfo?.nomClient || 'Unknown Client';
      const summary = `Invoice #${invoice.factureNumber} - ${clientName}`;
      
      // Simpler description without escaped newlines (Outlook handles this better)
      const description = `Invoice ${invoice.factureNumber} for ${clientName} - ${invoice.isPaid ? 'Paid' : 'Unpaid'}`;

      // All-day event (DTSTART;VALUE=DATE format)
      const dateStr = `${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}${String(invoiceDate.getDate()).padStart(2, '0')}`;
      
      // DTEND is next day for all-day events (RFC 5545 requirement)
      const nextDay = new Date(invoiceDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const endDateStr = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, '0')}${String(nextDay.getDate()).padStart(2, '0')}`;

      // Use invoice updatedAt for DTSTAMP (only changes when invoice changes)
      const dtstamp = invoice.updatedAt ? new Date(invoice.updatedAt) : invoiceDate;

      // Calculate SEQUENCE from updatedAt timestamp (more reliable than non-existent version field)
      const sequence = invoice.updatedAt 
        ? Math.floor(new Date(invoice.updatedAt).getTime() / 1000) % 1000
        : 0;

      // Get base URL for invoice link
      const baseUrl = req.headers.get('host') || 'factureme.com';
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const invoiceUrl = `${protocol}://${baseUrl}/invoices/${invoice.idFacture}`;

      // Build event lines with proper folding
      const eventLines = [
        'BEGIN:VEVENT',
        `UID:${eventId}`,
        `DTSTAMP:${formatICalDate(dtstamp)}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${endDateStr}`,
        `SUMMARY:${escapeICalText(summary)}`,
        `DESCRIPTION:${escapeICalText(description)}`,
        `URL:${invoiceUrl}`,
        `STATUS:${invoice.isPaid ? 'CONFIRMED' : 'TENTATIVE'}`,
        `SEQUENCE:${sequence}`,
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      ];

      // Fold long lines and add to main ics (each foldLine returns array of lines)
      eventLines.forEach(line => {
        const foldedLines = foldLine(line);
        icsLines.push(...foldedLines);
      });
    });

    icsLines.push('END:VCALENDAR');

    // Join with proper line endings (CRLF)
    const icsContent = icsLines.join('\r\n');

    // Return iCalendar file for subscription with appropriate headers
    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8; method=PUBLISH',
        'Cache-Control': `max-age=${CACHE_MAX_AGE_SECONDS}, must-revalidate`,
        'Content-Disposition': 'inline; filename="factureme-calendar.ics"',
        'ETag': etag,
        'Last-Modified': currentDate.toUTCString(),
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });

  } catch (error) {
    console.error('Error generating calendar export:', error);
    return new Response("Internal server error", { status: 500 });
  }
}
