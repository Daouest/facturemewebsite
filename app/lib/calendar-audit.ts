/**
 * Simple audit logging for calendar subscription access
 * In production, these should be stored in a database or logging service
 */

type AuditEvent = {
  timestamp: Date;
  userId: number;
  action: 'access' | 'invalid_token' | 'rate_limited';
  ip?: string;
  userAgent?: string;
};

// In-memory log (in production, use database or external logging service)
const auditLog: AuditEvent[] = [];
const MAX_LOG_SIZE = 1000;

export function logCalendarAccess(
  userId: number,
  action: AuditEvent['action'],
  metadata?: { ip?: string; userAgent?: string }
) {
  const event: AuditEvent = {
    timestamp: new Date(),
    userId,
    action,
    ip: metadata?.ip,
    userAgent: metadata?.userAgent,
  };

  auditLog.push(event);

  // Keep log size manageable
  if (auditLog.length > MAX_LOG_SIZE) {
    auditLog.shift();
  }

  // Console log for debugging (in production, send to logging service)
  console.log(
    `[Calendar Audit] ${action.toUpperCase()} - User ${userId} - ${metadata?.ip || 'unknown IP'}`
  );
}

export function getRecentAccessForUser(userId: number, limit = 10): AuditEvent[] {
  return auditLog
    .filter((event) => event.userId === userId)
    .slice(-limit)
    .reverse();
}

export function detectSuspiciousActivity(userId: number): boolean {
  const recentEvents = auditLog
    .filter((event) => event.userId === userId)
    .filter((event) => event.timestamp.getTime() > Date.now() - 60 * 60 * 1000); // Last hour

  // Flag if more than 10 invalid token attempts in the last hour
  const invalidAttempts = recentEvents.filter(
    (event) => event.action === 'invalid_token'
  ).length;

  return invalidAttempts > 10;
}
