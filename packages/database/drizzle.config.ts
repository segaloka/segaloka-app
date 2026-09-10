import { defineConfig } from 'drizzle-kit';

import { loadDatabaseToolingConfig } from './tooling/database-config.js';

const databaseConfig = loadDatabaseToolingConfig();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseConfig.url
  }
});
