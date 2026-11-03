import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // process.env (not env()) so `prisma generate` still works when DATABASE_URL
    // isn't set, e.g. during the Docker build.
    url: process.env.DATABASE_URL ?? "",
  },
});
