import type { Config } from 'drizzle-kit';
import path from 'path';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: path.join(process.cwd(), 'sqlite.db'),
  },
} satisfies Config;
