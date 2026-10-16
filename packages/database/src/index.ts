import { PrismaClient } from '@prisma/client';

function cleanDatabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;
  let clean = url.trim();
  // Strip surrounding single or double quotes if accidentally copied
  if ((clean.startsWith("'") && clean.endsWith("'")) || (clean.startsWith('"') && clean.endsWith('"'))) {
    clean = clean.slice(1, -1).trim();
  }
  // Remove channel_binding parameter as Prisma Rust TLS driver does not support it
  clean = clean.replace('&channel_binding=require', '').replace('channel_binding=require&', '').replace('?channel_binding=require', '');
  return clean;
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = cleanDatabaseUrl(process.env.DATABASE_URL);
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const cleanedUrl = cleanDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: cleanedUrl ? { db: { url: cleanedUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
