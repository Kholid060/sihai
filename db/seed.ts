import 'dotenv/config';
import { drizzle } from '../server/lib/drizzle';
import { plansTable } from './schema';
import { APP_PLAN_ID } from '~/server/const/app.const';

await drizzle
  .insert(plansTable)
  .values({
    maxUrl: 4,
    maxRedirect: 400,
    name: 'Free plan',
    id: APP_PLAN_ID.free,
  })
  .onConflictDoNothing();

await drizzle.$client.end();

console.log('Seed success');
