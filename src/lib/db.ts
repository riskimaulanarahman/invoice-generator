import { PrismaClient } from '@prisma/client'
import { resolve } from 'node:path'

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${resolve(process.cwd(), 'db', 'custom.db')}`
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
