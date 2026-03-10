/**
 * One-time script: creates OrgChatRoom and OrgChatMessage tables and backfills rooms for existing orgs.
 * Run: node scripts/run-org-chat-migration.js
 * Requires: DATABASE_URL in .env (MySQL). Load .env with dotenv if needed.
 */

const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/);
      if (m) process.env.DATABASE_URL = m[1].trim().replace(/^["']|["']$/g, '');
    }
  }
}

async function main() {
  loadEnv();
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const migrationPath = path.join(__dirname, '../prisma/migrations/20260210200000_add_org_group_chat/migration.sql');
  let sql = fs.readFileSync(migrationPath, 'utf8');
  sql = sql.replace(/--[^\n]*/g, '').trim();
  const statements = sql.split(';').map((s) => s.trim()).filter((s) => s.length > 0);

  for (const st of statements) {
    const q = st + ';';
    try {
      await prisma.$executeRawUnsafe(q);
      console.log('OK:', q.slice(0, 55) + '...');
    } catch (e) {
      if (e.code === 'ER_TABLE_EXISTS_ERROR' || (e.message && (e.message.includes('already exists') || e.message.includes('Duplicate')))) {
        console.log('Skip (exists):', q.slice(0, 50) + '...');
      } else {
        console.error('Error:', e.message);
        throw e;
      }
    }
  }

  await prisma.$disconnect();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
