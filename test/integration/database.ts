import 'dotenv/config';
import { createClient } from '../../src/database/client.js';

// Integration tests mutate data: refuse to run on any non-test database.
export function testDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url || new URL(url).pathname !== '/business_card_test') {
    throw new Error('Integration tests require the isolated business_card_test database');
  }
  return createClient(url);
}
