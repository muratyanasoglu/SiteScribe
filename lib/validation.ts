/**
 * Server-side input validation and sanitization.
 * Use for all user input to guard against injection, XSS, and oversized payloads.
 */

const LIMITS = {
  name: 200,
  username: 30,
  slug: 80,
  description: 2000,
  email: 254,
  passwordMin: 8,
  passwordMax: 128,
  url: 2048,
  commentBody: 10000,
  chatMessageBody: 10000,
  templateTitle: 500,
  templateBody: 50000,
  webhookSecret: 256,
  inviteToken: 100,
  evidenceTitle: 500,
  evidenceDescription: 5000,
  evidenceFileSizeMax: 8 * 1024 * 1024, // 8 MB
} as const;

/** Allowed MIME types for evidence file uploads (images and PDF only). */
export const ALLOWED_EVIDENCE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

/** Normalize whitespace (collapse to single space) and trim; cap at maxLength. */
export function sanitizeString(s: unknown, maxLength: number): string {
  if (s == null || typeof s !== 'string') return '';
  const t = s.replace(/\s+/g, ' ').trim();
  return t.slice(0, maxLength);
}

/** Password: min/max length (used for registration and sign-in). */
export function validatePassword(input: unknown): { ok: true; password: string } | { ok: false; error: string } {
  const raw = typeof input === 'string' ? input : '';
  if (raw.length < LIMITS.passwordMin) return { ok: false, error: `Password must be at least ${LIMITS.passwordMin} characters` };
  if (raw.length > LIMITS.passwordMax) return { ok: false, error: 'Password too long' };
  return { ok: true, password: raw };
}

/** Email format and length check. */
export function validateEmail(input: unknown): { ok: true; email: string } | { ok: false; error: string } {
  const raw = typeof input === 'string' ? input.trim().toLowerCase() : '';
  if (!raw) return { ok: false, error: 'E-posta gerekli' };
  if (raw.length > LIMITS.email) return { ok: false, error: 'Email too long' };
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(raw)) return { ok: false, error: 'Invalid email format' };
  return { ok: true, email: raw };
}

/** URL: only http(s) allowed; length checked. */
export function validateUrl(input: unknown): { ok: true; url: string } | { ok: false; error: string } {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return { ok: false, error: 'URL gerekli' };
  if (raw.length > LIMITS.url) return { ok: false, error: 'URL too long' };
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { ok: false, error: 'Sadece http veya https desteklenir' };
    }
    return { ok: true, url: raw };
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }
}

/** Organization or project name (sanitized, required). */
export function validateName(input: unknown, fieldName = 'Ad'): { ok: true; name: string } | { ok: false; error: string } {
  const name = sanitizeString(input, LIMITS.name);
  if (!name) return { ok: false, error: `${fieldName} gerekli` };
  return { ok: true, name };
}

/** Username: 3–30 chars, alphanumeric + underscore (for friend search) */
export function validateUsername(input: unknown): { ok: true; username: string } | { ok: false; error: string } {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (raw.length < 3) return { ok: false, error: 'Username must be at least 3 characters' };
  const username = raw.slice(0, LIMITS.username).toLowerCase();
  if (!/^[a-z0-9_]+$/.test(username)) return { ok: false, error: 'Username can only contain letters, numbers and underscore' };
  return { ok: true, username };
}

/** Slug: lowercase, digits, hyphens only (e.g. for org URL segment). */
export function validateSlug(input: unknown): { ok: true; slug: string } | { ok: false; error: string } {
  const raw = typeof input === 'string' ? input.trim().toLowerCase() : '';
  const slug = raw.slice(0, LIMITS.slug).replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!slug) return { ok: false, error: 'Slug gerekli' };
  return { ok: true, slug };
}

/** Optional description field (sanitized, no requirement). */
export function sanitizeDescription(input: unknown): string {
  return sanitizeString(input, LIMITS.description);
}

/** Comment body (e.g. on a Change Order); required, sanitized. */
export function validateCommentBody(input: unknown): { ok: true; body: string } | { ok: false; error: string } {
  const body = sanitizeString(input, LIMITS.commentBody);
  if (!body) return { ok: false, error: 'Yorum metni gerekli' };
  return { ok: true, body };
}

/** Chat message body; required, sanitized, length-limited. */
export function validateChatMessageBody(input: unknown): { ok: true; body: string } | { ok: false; error: string } {
  const body = sanitizeString(input, LIMITS.chatMessageBody);
  if (!body) return { ok: false, error: 'Message cannot be empty' };
  return { ok: true, body };
}

/** Invitation token (hex string from invite link query). */
export function validateInviteToken(input: unknown): { ok: true; token: string } | { ok: false; error: string } {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw || raw.length > LIMITS.inviteToken) return { ok: false, error: 'Invalid invitation link' };
  if (!/^[a-fA-F0-9]+$/.test(raw)) return { ok: false, error: 'Invalid invitation link' };
  return { ok: true, token: raw };
}

/** Validates Prisma CUID-like IDs to avoid injection and spurious DB queries. */
export function isValidId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  if (id.length < 20 || id.length > 30) return false;
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

/** Safe internal path for notification links (prevents open redirect / javascript:). Only allows relative paths. */
export function sanitizeNotificationLink(link: unknown): string | null {
  if (link == null || typeof link !== 'string') return null;
  const s = link.trim();
  if (!s.startsWith('/') || s.startsWith('//') || s.length > 2048) return null;
  if (/^\s*javascript:/i.test(s) || /^\s*data:/i.test(s)) return null;
  return s;
}

export { LIMITS };
