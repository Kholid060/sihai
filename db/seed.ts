import 'dotenv/config';
import { drizzle } from '../server/lib/drizzle';
import { plansTable } from './schema';
import { APP_FREE_PLAN } from '~/server/const/app.const';
import { buildConflictUpdateColumns } from './db-utils';

await drizzle
  .insert(plansTable)
  .values(APP_FREE_PLAN)
  .onConflictDoUpdate({
    target: plansTable.id,
    set: buildConflictUpdateColumns(plansTable, [
      'name',
      'maxRules',
      'maxRedirect',
    ]),
  });

await drizzle.$client.end();

console.log('Seed success');
