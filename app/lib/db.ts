import { readFileSync } from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// The Lightsail/RDS database requires SSL. Prisma 7 connects through `pg`,
// which doesn't use SSL by default, so enable it and verify the server
// certificate against Amazon's RDS CA bundle (Node doesn't trust it by default).
// Bundle source: https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
const rdsCa = readFileSync(
  path.join(process.cwd(), "certs", "rds-global-bundle.pem"),
  "utf8"
);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { ca: rdsCa },
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
