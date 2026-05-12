import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT || 5432),
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  await ensureDatabase();
  return getPool().query<T>(text, values);
}

export async function ensureDatabase() {
  if (initialized) return;
  initPromise ??= getPool()
    .query(`
      create table if not exists registrations (
        reference_code text primary key,
        password_hash text not null,
        name text not null,
        email text not null,
        phone text not null,
        organization text not null,
        job_title text not null,
        ticket_type text not null,
        dietary_needs text not null default '',
        accessibility_needs text not null default '',
        emergency_contact text not null,
        notes text not null default '',
        documents jsonb not null default '[]'::jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists registration_documents (
        reference_code text not null references registrations(reference_code) on delete cascade,
        stored_name text not null,
        data bytea not null,
        created_at timestamptz not null default now(),
        primary key (reference_code, stored_name)
      );
    `)
    .then(() => {
      initialized = true;
    })
    .catch((error) => {
      initPromise = null;
      throw error;
    });
  await initPromise;
}
