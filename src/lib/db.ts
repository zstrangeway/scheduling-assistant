import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}


export const db =
globalForPrisma.prisma ??
new PrismaClient({
  log: ['query'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export type TransactionClient = Parameters<Parameters<typeof db['$transaction']>[0]>[0]
