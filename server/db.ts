import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Prefer DATABASE_URL first, only use individual PG* variables as fallback
let connectionString = process.env.DATABASE_URL;

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'exists (using this)' : 'not set');
if (process.env.DATABASE_URL) {
  // Log the hostname without exposing credentials
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('Database hostname:', url.hostname);
  } catch (e) {
    console.log('Could not parse DATABASE_URL');
  }
}

// Only use individual PG variables if DATABASE_URL is not available
if (!connectionString && process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE && process.env.PGPORT) {
  const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT } = process.env;
  connectionString = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
  console.log('DATABASE_URL not available, constructing from individual PG* variables');
  console.log('Using host:', PGHOST);
}

if (!connectionString) {
  throw new Error(
    "DATABASE_URL or PostgreSQL variables must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
