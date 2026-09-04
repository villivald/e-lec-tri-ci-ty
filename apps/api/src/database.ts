import { Pool } from 'pg';

const DEFAULT_DATABASE_URL =
  'postgres://academy:academy@localhost:5432/electricity';

export const createDatabase = (): Pool =>
  new Pool({
    connectionString: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
    connectionTimeoutMillis: 5_000,
  });
