/**
 * In-memory rate limiting for auth and registration.
 * In serverless, limits apply per instance; for distributed limits use Redis (e.g. Upstash).
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_AUTH_REQUESTS_PER_IP = 30; // max requests per IP per minute to /api/auth/*

const authIpCount = new Map<string, { count: number; resetAt: number }>();

function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}

/** Returns true if the client IP has exceeded the auth request limit for this window. */
export function isAuthRateLimited(headers: Headers): boolean {
  const ip = getClientIp(headers);
  const now = Date.now();
  let entry = authIpCount.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    authIpCount.set(ip, entry);
  }
  entry.count++;
  if (entry.count === 1) pruneAuthMap();
  return entry.count > MAX_AUTH_REQUESTS_PER_IP;
}

/** Remove expired entries from the auth IP map to bound memory (lazy cleanup). */
function pruneAuthMap() {
  const now = Date.now();
  for (const [key, v] of authIpCount.entries()) {
    if (now > v.resetAt) authIpCount.delete(key);
  }
}

// --- Failed login attempts (per email) ---
const LOGIN_FAIL_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_FAILURES = 8;

const loginFailCount = new Map<string, { count: number; resetAt: number }>();

export function recordLoginFailure(email: string): void {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  let entry = loginFailCount.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + LOGIN_FAIL_WINDOW_MS };
    loginFailCount.set(key, entry);
  }
  entry.count++;
}

export function isLoginBlocked(email: string): boolean {
  const key = email.trim().toLowerCase();
  const entry = loginFailCount.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    loginFailCount.delete(key);
    return false;
  }
  return entry.count >= MAX_LOGIN_FAILURES;
}

// --- Registration (per IP) ---
const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REGISTERS_PER_IP = 5;
const registerIpCount = new Map<string, { count: number; resetAt: number }>();

export function isRegisterRateLimited(headers: Headers): boolean {
  const ip = getClientIp(headers);
  const now = Date.now();
  let entry = registerIpCount.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + REGISTER_WINDOW_MS };
    registerIpCount.set(ip, entry);
  }
  entry.count++;
  return entry.count > MAX_REGISTERS_PER_IP;
}

export function getRegisterRemaining(headers: Headers): number {
  const ip = getClientIp(headers);
  const entry = registerIpCount.get(ip);
  if (!entry) return MAX_REGISTERS_PER_IP;
  if (Date.now() > entry.resetAt) return MAX_REGISTERS_PER_IP;
  return Math.max(0, MAX_REGISTERS_PER_IP - entry.count);
}
