import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "postgresql://neondb_owner:npg_tJ4uPld0fqCV@ep-cold-mud-a414wl6q-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});
