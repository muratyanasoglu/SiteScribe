# Security

This document describes the security measures implemented in SiteScribe.

## Authentication & session

- **NextAuth (Credentials)**  
  - Passwords hashed with **bcrypt** (cost 10).  
  - **NEXTAUTH_SECRET** is required in production (runtime check on startup).  
  - **useSecureCookies** in production (HTTPS).  
  - Session: JWT, 30-day max age.

- **Rate limiting**  
  - **Auth** (`/api/auth/*`): 30 requests per IP per minute.  
  - **Login failures**: 8 failures per email in 15 minutes → block.  
  - **Registration**: 5 attempts per IP per hour.

- **Protected routes**  
  - Middleware protects `/org`, `/projects`, `/notifications`, `/chat`, `/friends`.  
  - Unauthenticated users are redirected to `/login`.

## Authorization

- **Organization & project access**  
  - All sensitive server actions use `requireOrgRole` or `requireProjectAccess`.  
  - IDs (organization, project, user, etc.) are validated with **isValidId** (CUID-like format, length) before use.

- **RBAC**  
  - Roles: VIEWER, SUBCONTRACTOR, FIELD, PM, OWNER.  
  - Upload, comment, export, approval, etc. are gated by role (see `lib/rbac.ts`).

## Input validation & sanitization

- **lib/validation.ts**  
  - Email, password (length, format).  
  - Name, username, slug, URL, comment/chat body (length, sanitize).  
  - **isValidId** for all Prisma IDs from the client.  
  - **sanitizeNotificationLink**: only internal paths (`/...`), no `javascript:` or `data:`.

- **Invite**  
  - Role must be one of VIEWER, SUBCONTRACTOR, FIELD, PM.  
  - Invitation token format and expiry checked.

- **Evidence upload**  
  - MIME allowlist: JPEG, PNG, WebP, PDF.  
  - Max file size (8 MB).  
  - Filename sanitized for storage key.

## XSS & injection

- **Mermaid diagrams**  
  - **securityLevel: 'strict'**.  
  - Diagram code length capped (10k chars).

- **No raw SQL**  
  - All DB access via Prisma (parameterized).

- **Notification links**  
  - Stored links sanitized (internal path only) to prevent open redirect / `javascript:`.

## API & cron

- **Cron endpoint** (`/api/cron/scheduled-export`)  
  - Protected by **CRON_SECRET** query param.  
  - **Timing-safe comparison** for the secret (no timing leaks).

## Security headers (next.config.js)

- **X-Frame-Options**: DENY  
- **X-Content-Type-Options**: nosniff  
- **X-XSS-Protection**: 1; mode=block  
- **Referrer-Policy**: strict-origin-when-cross-origin  
- **Permissions-Policy**: camera, microphone, geolocation disabled  
- **Content-Security-Policy**: default-src 'self'; script/style/img/connect restricted; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests  
- **Strict-Transport-Security** (production only): max-age=31536000; includeSubDomains; preload  

## Error handling

- **app/error.tsx**  
  - Generic message shown to users.  
  - Full error logged only in development (no sensitive stack in production logs).

## Secrets & environment

- **.gitignore**  
  - `.env`, `.env.local`, and variants are ignored.  
  - Only `.env.example` (no real secrets) is committed.

- **Sensitive config**  
  - Database URL, NEXTAUTH_SECRET, CRON_SECRET, API keys (Mistral, Resend, etc.) must be set via environment variables, never in code.

## Checklist for deploy

1. Set **NEXTAUTH_SECRET** (e.g. `openssl rand -base64 32`).  
2. Set **DATABASE_URL** (MySQL).  
3. Set **CRON_SECRET** if using scheduled exports.  
4. Use **HTTPS** in production (NEXTAUTH_URL with `https://`).  
5. Keep dependencies updated (`npm audit`, `npm update`).
