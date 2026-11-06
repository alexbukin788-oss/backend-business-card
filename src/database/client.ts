import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

export function createClient(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL is required');
  const adapter = new PrismaPg({ connectionString: url, max: 5, connectionTimeoutMillis: 5000 });
  return new PrismaClient({ adapter, log: [{ level: 'query', emit: 'event' }] });
}
export type DatabaseClient = ReturnType<typeof createClient>;
