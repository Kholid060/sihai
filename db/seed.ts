import 'dotenv/config';
import { drizzle } from '../server/lib/drizzle';

// code here

await drizzle.$client.end();

console.log('Seed success');
