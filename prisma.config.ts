import { defineConfig, env } from 'prisma/config';
import 'dotenv/config';
export default defineConfig({
  schema: 'src/infra/database/prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
