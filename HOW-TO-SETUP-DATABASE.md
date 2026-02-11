# How to Setup Database

This guide explains how to set up the database for **SiteScribe**. The project uses **MySQL 8.x** with **Prisma** as the ORM.

---

## Prerequisites

- **Node.js** (v18 or later recommended)
- **MySQL 8.x** installed and running locally or on a remote server
- (Optional) **MySQL Workbench** or any MySQL client for inspecting data

---

## 1. Create the MySQL Database

Create an empty database and a user that has full access to it.

**Option A – MySQL client (command line):**

```sql
CREATE DATABASE sitescribe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sitescribe'@'localhost' IDENTIFIED BY 'sitescribe';
GRANT ALL PRIVILEGES ON sitescribe.* TO 'sitescribe'@'localhost';
FLUSH PRIVILEGES;
```

**Option B – MySQL Workbench:**

1. Connect to your MySQL server.
2. Create a new schema named `sitescribe` (default charset: `utf8mb4`, collation: `utf8mb4_unicode_ci`).
3. Create a user (e.g. `sitescribe`) with a password and grant **All privileges** on schema `sitescribe`.

---

## 2. Configure `DATABASE_URL`

The app reads the database connection from the `DATABASE_URL` environment variable.

**Format:**

```
mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

**Example (local MySQL):**

```
mysql://sitescribe:sitescribe@localhost:3306/sitescribe
```

- **USERNAME** – MySQL user (e.g. `sitescribe`)
- **PASSWORD** – User password
- **HOST** – `localhost` or your MySQL host
- **PORT** – Usually `3306`
- **DATABASE_NAME** – Database name (e.g. `sitescribe`)

---

## 3. Environment File

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set `DATABASE_URL` to match your MySQL setup:

   ```env
   DATABASE_URL="mysql://sitescribe:sitescribe@localhost:3306/sitescribe"
   ```

Do **not** commit `.env`; it should remain in `.gitignore`.

---

## 4. Install Dependencies and Generate Prisma Client

```bash
npm install
npx prisma generate
```

Or use the npm script:

```bash
npm run db:generate
```

This generates the Prisma Client used by the app.

---

## 5. Apply the Schema to the Database

Choose one of the following.

**Option A – Migrations (recommended for production / versioned schema):**

```bash
npx prisma migrate dev
```

Or:

```bash
npm run db:migrate
```

This applies all migrations and keeps a migration history in `prisma/migrations`.

**Option B – Push schema without migrations (quick local setup):**

```bash
npx prisma db push
```

Or:

```bash
npm run db:push
```

Use `db push` when you want the database to match `schema.prisma` without creating migration files (e.g. prototyping). For production, prefer `migrate dev` / `migrate deploy`.

---

## 6. (Optional) Seed the Database

The project includes a seed script that creates a demo user, organization, and sample data.

```bash
npx prisma db seed
```

Or:

```bash
npm run db:seed
```

Default demo credentials (from the seed) can be found in `prisma/seed.ts` (e.g. email `demo@sitescribe.app` and the password used there). Use only in development.

---

## 7. Verify the Setup

- **Prisma Studio** – Open a visual editor for your data:

  ```bash
  npx prisma studio
  ```

  Or:

  ```bash
  npm run db:studio
  ```

- **MySQL Workbench** – Connect with the same user and database; you should see the tables created by Prisma (e.g. `User`, `Organization`, `Project`, etc.).

---

## Quick Reference – npm Scripts

| Script          | Command              | Description                          |
|-----------------|----------------------|--------------------------------------|
| `db:generate`   | `prisma generate`    | Generate Prisma Client               |
| `db:migrate`    | `prisma migrate dev` | Run migrations (dev)                 |
| `db:push`       | `prisma db push`     | Sync schema to DB (no migration history) |
| `db:seed`       | `prisma db seed`     | Run seed script                      |
| `db:studio`     | `prisma studio`      | Open Prisma Studio                   |

---

## Troubleshooting

- **"Can't connect to MySQL server"**  
  Ensure MySQL is running and that `HOST` and `PORT` in `DATABASE_URL` are correct. Check firewall and that the MySQL user is allowed to connect from your host.

- **"Access denied for user"**  
  Check username and password in `DATABASE_URL`. Ensure the user has privileges on the database (e.g. `GRANT ALL ON sitescribe.*`).

- **"Unknown database"**  
  Create the database first (see step 1).

- **SSL / TLS errors (e.g. on hosted MySQL)**  
  You may need to add `?sslmode=require` or parameters required by your provider to `DATABASE_URL`. Refer to your host’s documentation.

- **Prisma Client out of sync**  
  After changing `prisma/schema.prisma`, run `npx prisma generate` again. After schema or migration changes, run `migrate dev` or `db push` as needed.

---

## Summary

1. Install and start **MySQL 8.x**.
2. Create database and user; set **`DATABASE_URL`** in `.env`.
3. Run **`npm install`** and **`npx prisma generate`**.
4. Apply schema with **`npx prisma migrate dev`** or **`npx prisma db push`**.
5. (Optional) Run **`npx prisma db seed`** for demo data.
6. Use **`npx prisma studio`** or MySQL Workbench to verify.

After this, you can start the app with `npm run dev` and use the database normally.
