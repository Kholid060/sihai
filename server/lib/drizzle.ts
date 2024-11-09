import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

let instance: (PostgresJsDatabase & { $client: postgres.Sql }) | null = null;

export function useDrizzle() {
  if (!instance) {
    const client = postgres(process.env.DATABASE_URL!, { prepare: false });
    instance = drizzlePostgres(client);
  }

  return instance;
}

export async function destroyDrizzle() {
  if (!instance) return;

  await instance.$client.end();
  instance = null;
}
