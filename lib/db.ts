import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema';

const client = process.env.DATABASE_URL 
  ? postgres(process.env.DATABASE_URL, { max: 1 })
  : null;

export const db = client ? drizzle(client, { schema }) : null;
