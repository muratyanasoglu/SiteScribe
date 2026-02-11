<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql" alt="MySQL" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

# **SiteScribe**

### *Evidence-Backed Change Order Intelligence for Construction*

**SiteScribe** is an enterprise-grade, open-source platform that turns scattered site logs, RFIs, plan revisions, and photos into **audit-ready Change Order drafts**—with optional AI, full traceability, and zero vendor lock-in.

---

## Table of Contents

- [Overview](#overview)
- [Why SiteScribe](#why-sitescribe)
- [Features](#features)
- [Architecture & Flow](#architecture--flow)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment & Configuration](#environment--configuration)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Security](#security)
- [Testing](#testing)
- [Internationalization](#internationalization)
- [Demo](#demo)
- [Contributing & License](#contributing--license)

---

## Overview

Construction teams lose time and money when **evidence** and **Change Orders** live in separate worlds. SiteScribe unifies them: one flow from evidence upload → signal detection → events → CO draft → export. Optional **Mistral AI** powers draft generation, semantic search, and signal enrichment. Multi-tenant by design (organizations, projects, RBAC), with **invites**, **notifications**, **webhooks**, and **scheduled exports**. Free forever; run on your own infrastructure or deploy to Vercel.

| Capability | Description |
|------------|-------------|
| **Evidence hub** | Site logs, photos, RFIs, plan revisions, contracts. PDF text extraction, chunking, evidence linking, plan comparison. |
| **Signal detection** | Heuristic + optional AI: keywords, plan revs, RFIs → events. Score and classify; generate CO drafts from template or LLM. |
| **CO editor** | Scope, clauses, cost line items, schedule impact. AI enrich, comments, approval workflow, audit log. |
| **Export** | PDF + ZIP + SHA-256 manifest. Mailto, email delivery (Resend), scheduled cron exports. |
| **Multi-tenant** | Organizations, projects, roles (VIEWER → OWNER). Email invites, notifications, webhooks (e.g. Slack/ERP). |

---

## Why SiteScribe

- **Single source of truth** — Evidence and Change Orders live in one place. No more chasing documents across email and drives.
- **Audit-ready** — Manifest with file hashes, audit log, and citation-style evidence references in CO text.
- **AI when you want it** — Mistral-powered drafts, semantic search, signal scoring. Disable AI and the app still runs at full capacity.
- **Open source & free** — No subscriptions, no paywalls. Self-host or use as-is; the codebase is yours.
- **Built for construction** — Roles and workflows match how GCs, subs, PMs, and owners actually work.

---

## Features

### Evidence & Documents

- **Upload** — PDF, JPEG, PNG, WebP. Types: Site Log, RFI, Plan Revision, Photo, Contract, Other.
- **Text extraction** — PDFs chunked for search and citations; full-text and optional semantic (embedding) search.
- **Evidence links** — Relate items (e.g. “this RFI references that plan revision”). Plan revision compare: side-by-side text view.
- **AI (optional)** — Summaries, type/title/description suggestions; Pixtral for image descriptions.

### Signals & Events

- **Detection** — Scan recent evidence for change signals (keywords, plan revisions, RFIs). Group into events; set status (Open, In progress, Done).
- **AI enrichment** — Per-signal scoring and reasoning (Mistral). Suggested signal type and structured fields (delay days, cost impact).

### Change Orders

- **Draft from template or AI** — One click from an event. Template library per organization; or LLM-generated scope, clauses, cost/schedule.
- **Editor** — Title, scope narrative, contract clauses, assumptions, exclusions, schedule impact, cost line items, status.
- **AI enrich** — Improve existing CO with evidence-backed suggestions.
- **Comments** — Thread discussions on each CO.
- **Approval** — In review → Approved/Rejected; who approved and when.

### Export & Delivery

- **PDF + ZIP** — CO PDF plus evidence files and a manifest (SHA-256). Download or send via mailto.
- **Email** — Optional Resend integration: send export package as attachment.
- **Scheduled exports** — Cron-triggered; choose project, CO(s), optional notification email. Secure with `CRON_SECRET`.

### Organization & Collaboration

- **Organizations & projects** — Multi-tenant; RBAC: VIEWER, SUBCONTRACTOR, FIELD, PM, OWNER.
- **Invites** — Email invitations with role; accept via link.
- **Notifications** — In-app list; mark read; links to CO, invite, etc.
- **Webhooks** — POST to your URL on `co.created`, `co.status_changed` (OWNER only).
- **Friends & chat** — Add friends by username; 1:1 chat between friends. Optional for team coordination.

### Platform

- **i18n** — English, Türkçe, Español, Français. Cookie-based locale; all UI strings externalized.
- **Dark mode** — System / light / dark via next-themes.
- **PWA** — `manifest.json` for add-to-home; optional service worker.
- **Security** — NextAuth (credentials, bcrypt), middleware-protected routes, rate limiting, security headers, HSTS in production.

---

## Architecture & Flow

End-to-end flow:

```mermaid
flowchart LR
  A[Evidence] --> B[Signals]
  B --> C[Events]
  C --> D[CO Draft]
  D --> E[Edit & Export]
  E --> F[PDF + ZIP]
```

- **Evidence** — Upload and link documents/photos.
- **Signals** — Run detection; events are created/updated.
- **Events** — Classify status; choose “Generate CO draft” (template or AI).
- **CO** — Edit, add line items, optional AI enrich, comments, approval.
- **Export** — PDF + ZIP + manifest; mailto, email, or scheduled cron.

All queries are scoped by organization and project; RBAC enforced in server actions and layouts.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router), React 18 |
| **Language** | TypeScript 5.6 |
| **Database** | MySQL 8.x, Prisma ORM |
| **Auth** | NextAuth (credentials, bcrypt), JWT |
| **AI** | Mistral API (chat, embeddings); optional Pixtral (vision) |
| **Storage** | Local filesystem or Vercel Blob |
| **UI** | Tailwind CSS, Radix UI, shadcn-style components, next-themes |
| **Email** | Resend (optional) |
| **Export** | pdf-lib, jszip, SHA-256 manifest; cron for scheduled jobs |

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **MySQL** 8.x (local or remote)

### 1. Clone & install

```bash
git clone https://github.com/your-org/sitescribe.git
cd sitescribe
npm install
```

### 2. Database

Create database and user (e.g. MySQL Workbench or CLI):

```sql
CREATE DATABASE sitescribe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sitescribe'@'localhost' IDENTIFIED BY 'sitescribe';
GRANT ALL PRIVILEGES ON sitescribe.* TO 'sitescribe'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Environment

```bash
cp .env.example .env
```

Edit `.env` with at least:

```env
DATABASE_URL="mysql://sitescribe:sitescribe@localhost:3306/sitescribe"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Migrate & seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Run

```bash
npm run dev
```

Open **http://localhost:3000**. Sign in with demo credentials (see [Demo](#demo)).

---

## Environment & Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for JWT/session (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `http://localhost:3000` or `https://yourdomain.com`) |
| `STORAGE_PROVIDER` | No | `local` (default) or `vercel` |
| `UPLOAD_DIR` | No | For local storage (e.g. `public/uploads`) |
| `BLOB_READ_WRITE_TOKEN` | If Vercel | For Vercel Blob storage |
| `ENABLE_AI` | No | `true` to enable Mistral AI features |
| `MISTRAL_API_KEY` | If AI | Mistral API key |
| `MISTRAL_MODEL` | No | e.g. `mistral-small-latest` |
| `MISTRAL_EMBED_MODEL` | No | e.g. `mistral-embed` |
| `MISTRAL_VISION_MODEL` | No | e.g. `pixtral-12b-2409` for image description |
| `RESEND_API_KEY` | No | For email invites and export-by-email |
| `EMAIL_FROM` | No | Sender address for Resend |
| `CRON_SECRET` | No | Secret for `/api/cron/scheduled-export` |

See `.env.example` for the full list and comments.

---

## Project Structure

```
├── app/
│   ├── actions/          # Server actions (auth, org, project, evidence, CO, AI, export, chat, …)
│   ├── api/              # NextAuth, cron
│   ├── chat/             # 1:1 chat (friends)
│   ├── friends/          # Friend requests, username
│   ├── invite/           # Accept invitation
│   ├── login/, register/
│   ├── org/              # Organizations, invitations, webhooks
│   ├── projects/         # Project list
│   ├── projects/[id]/    # Dashboard, evidence, signals, search, CO, exports, templates, scheduled-exports
│   ├── notifications/
│   ├── guide/, docs/
│   ├── error.tsx, not-found.tsx
│   └── layout.tsx, page.tsx
├── components/           # UI, landing, theme, locale, toasts
├── lib/
│   ├── auth-server.ts    # getSession, requireProjectAccess, requireOrgRole
│   ├── rbac.ts           # Role hierarchy
│   ├── storage.ts        # Local / Vercel Blob
│   ├── pdf-extract.ts    # PDF text + chunking
│   ├── detect-signals.ts # Heuristic detection
│   ├── co-draft.ts       # Template + LLM CO generator
│   ├── llm-co.ts         # Mistral CO generation
│   ├── ai-*.ts           # Mistral client, evidence, signals, search, chat, summaries, docs, photo
│   ├── export-package.ts # PDF + ZIP + manifest
│   ├── validation.ts, rate-limit.ts, notifications.ts, webhook.ts, audit.ts, …
│   └── i18n.ts           # Locale, messages
├── messages/             # en.json, tr.json, es.json, fr.json
├── prisma/
│   ├── schema.prisma    # MySQL models
│   ├── migrations/
│   └── seed.ts
├── __tests__/            # rbac, detect-signals, export-manifest, chat-validation
└── public/
    └── manifest.json
```

---

## Deployment

### Vercel (recommended)

1. Push the repo to GitHub and import in Vercel.
2. Use a **production MySQL** (e.g. PlanetScale, Railway). Set `DATABASE_URL` in Vercel.
3. Set `NEXTAUTH_URL` to your production URL and a strong `NEXTAUTH_SECRET`.
4. **Storage:** For uploads in production set `STORAGE_PROVIDER=vercel`, `BLOB_READ_WRITE_TOKEN` (and optionally `VERCEL_BLOB_STORE_ID`).
5. **AI:** Set `ENABLE_AI=true` and `MISTRAL_API_KEY` (and optional vision model) if you want AI.
6. **Build:** `npm run build` runs `prisma generate` and `next build`. Run migrations against the production DB (e.g. `npx prisma migrate deploy` with production `DATABASE_URL`).
7. **Cron:** For scheduled exports set `CRON_SECRET` and call `/api/cron/scheduled-export` with that secret (e.g. Vercel Cron).

### Self-hosted

Run `npm run build` and `npm start` behind a reverse proxy (nginx, Caddy). Use HTTPS and a strong `NEXTAUTH_SECRET`. Point `DATABASE_URL` to your MySQL instance.

---

## Security

- **Authentication** — NextAuth with credentials and bcrypt. Middleware protects `/org`, `/projects`, `/notifications`, `/chat`, `/friends`; unauthenticated users are redirected to `/login`.
- **Authorization** — Server actions use `requireOrgRole` or `requireProjectAccess` with RBAC. All project/org IDs validated.
- **Headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; HSTS in production.
- **Rate limiting** — Auth API (IP), failed login (email), registration (IP). See `lib/rate-limit.ts`.
- **Cron** — `/api/cron/scheduled-export` only runs when `CRON_SECRET` query param matches.
- **Uploads** — Max 8 MB; allowed types: JPEG, PNG, WebP, PDF; length limits on title/description.
- **Validation** — `lib/validation.ts` for email, URL, names, slug, comments, password, invite tokens, chat message body and IDs.

Use HTTPS and a strong `NEXTAUTH_SECRET` in production; run `npm audit` periodically.

---

## Testing

```bash
npm test
```

| Test suite | Coverage |
|------------|----------|
| `__tests__/rbac.test.ts` | Role hierarchy and permissions |
| `__tests__/detect-signals.test.ts` | Keyword and revision scoring |
| `__tests__/export-manifest.test.ts` | Manifest shape and SHA-256 |
| `__tests__/chat-validation.test.ts` | Chat message body and ID validation |

---

## Internationalization

UI is fully localized in **English**, **Türkçe**, **Español**, and **Français**. Locale is stored in a cookie; all copy lives in `messages/{locale}.json`. Error and 404 pages use the same keys. Add or edit keys there to extend or customize copy.

---

## Demo

After running `npx prisma db seed`:

| Field | Value |
|-------|--------|
| **Email** | `demo@sitescribe.app` |
| **Password** | `demo1234` |

**Suggested path:** Organizations → **Demo Organization** → View projects → **Demo Construction Project** → Evidence (upload/list) → Signals → **Run detection** → open an event → **Generate CO draft** (template or AI) → open CO → **Enrich with AI** (if enabled) → **Export PDF + ZIP** / **Export + mailto**.

---

## Contributing & License

- **License:** MIT. Use, modify, and distribute with attribution.
- **Contributions:** Welcome. Open an issue or PR; follow existing code style and add tests where relevant.

---

<p align="center">
  <strong>SiteScribe</strong> — Evidence-backed Change Order intelligence. Open source. Free forever.
</p>
