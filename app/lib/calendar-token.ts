import crypto from 'crypto';

// Ensure secret is set in production
const CALENDAR_TOKEN_SECRET = process.env.CALENDAR_TOKEN_SECRET;

if (!CALENDAR_TOKEN_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CALENDAR_TOKEN_SECRET environment variable is required in production');
  }
  console.warn('⚠️  WARNING: Using default CALENDAR_TOKEN_SECRET. Set environment variable in production!');
}

const SECRET = CALENDAR_TOKEN_SECRET || 'dev-secret-change-in-production';

/**
 * Generate a secure calendar subscription token for a user
 * Token encodes userId and timestamp, signed with HMAC
 * Format: {userId}.{timestamp}.{signature}
 */
export function generateCalendarToken(userId: number): string {
  const timestamp = Date.now();
  const payload = `${userId}.${timestamp}`;
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');
  
  // Encode the full token as base64url for cleaner URLs
  const fullToken = `${payload}.${signature}`;
  return Buffer.from(fullToken).toString('base64url');
}

// Token expiration: 30 days
const TOKEN_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Validate a calendar token and extract the userId
 * Returns userId if valid, null if invalid or expired
 */
export function validateCalendarToken(token: string): number | null {
  try {
    // Decode from base64url
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split('.');
    
    if (parts.length !== 3) {
      return null;
    }
    
    const [userIdStr, timestampStr, providedSignature] = parts;
    const userId = parseInt(userIdStr);
    const timestamp = parseInt(timestampStr);
    
    if (isNaN(userId) || isNaN(timestamp)) {
      return null;
    }
    
    // Check token expiration (30 days)
    const now = Date.now();
    if (now - timestamp > TOKEN_EXPIRATION_MS) {
      return null;
    }
    
    // Verify signature using timing-safe comparison
    const payload = `${userIdStr}.${timestampStr}`;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex');
    
    // Timing-safe comparison
    const providedBuffer = Buffer.from(providedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (providedBuffer.length !== expectedBuffer.length) {
      return null;
    }
    
    const isValid = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
    
    return isValid ? userId : null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}
