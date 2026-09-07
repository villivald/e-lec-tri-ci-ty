import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';

const DEFAULT_DATABASE_URL =
  'postgres://academy:academy@localhost:5432/electricity';

export const createDatabase = (): Pool => {
  if (process.env.VERCEL && !process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL must be configured for the Vercel API project.',
    );
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 5_000,
  });

  if (process.env.VERCEL) attachDatabasePool(pool);

  return pool;
};
