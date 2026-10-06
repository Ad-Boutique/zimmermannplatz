/* Datenbankzugriff: Neon Postgres ueber den serverless Treiber.
   Erwartet DATABASE_URL (Neon-Integration) oder POSTGRES_URL (Vercel Postgres). */
const { neon } = require("@neondatabase/serverless");

let sqlClient = null;
let ensured = false;

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL fehlt");
  if (!sqlClient) sqlClient = neon(url);
  return sqlClient;
}

async function ensureSchema() {
  if (ensured) return;
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source TEXT NOT NULL,
    top TEXT,
    unit_summary TEXT,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    consent BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'neu',
    note TEXT,
    ip TEXT,
    user_agent TEXT,
    mail_delivered BOOLEAN
  )`;
  /* Spalte fuer das Interesse aus dem allgemeinen Kontaktformular, nachtraeglich ergaenzt */
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS interest TEXT`;
  /* Migration 06.10.2026: Ergebnis der Weiterleitung an Justimmo (ok, fehler, kein Objekt, aus) */
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS justimmo_status TEXT`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS justimmo_info TEXT`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS justimmo_at TIMESTAMPTZ`;
  ensured = true;
}

module.exports = { getSql, ensureSchema };
