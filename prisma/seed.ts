import 'dotenv/config';
import { createClient } from '../src/database/client.js';
import { seedProfile } from '../src/profile/seed-profile.js';
import { profileData } from './profile.data.js';

async function main() {
  const client = createClient();
  try {
    await seedProfile(client, profileData);
    console.log('Profile initialized');
  } finally {
    await client.$disconnect();
  }
}
main().catch((error) => {
  console.error('Profile initialization failed:', error.name);
  process.exitCode = 1;
});
