import dotenv from '@dotenvx/dotenvx';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

export default defineConfig({
  out: './db/drizzle',
  schema: './db/schema.ts',
  schemaFilter: ['public'],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
