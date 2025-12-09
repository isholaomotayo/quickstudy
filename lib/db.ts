import { PrismaClient } from '@prisma/client'
// In development, prefer DATABASE_URL_DEV if provided
if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL_DEV) {
	process.env.DATABASE_URL = process.env.DATABASE_URL_DEV
}

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
