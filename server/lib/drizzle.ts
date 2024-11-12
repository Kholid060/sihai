import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export type DrizzleDB = PostgresJsDatabase & { $client: postgres.Sql };

let instance: DrizzleDB | null = null;

export function useDrizzle() {
  if (!instance || !import.meta.dev) {
    const client = postgres(useRuntimeConfig().dbURL, { prepare: false });
    instance = drizzlePostgres(client);
  }

  return instance;
}
