/**
 * Server-only DB for API routes.
 * In-memory store so Vercel works without KV. (Data may not persist across instances.)
 * For persistence, add Redis/KV in Vercel and use KV store with key "premium_db".
 */

export type Db = {
  users: Array<{
    id: string
    email: string
    name: string
    createdAt: string
    passwordHash: string
    isLifetimePremium: boolean
  }>
  codes: Array<{
    id: string
    codeHash: string
    createdAt: string
    expiresAt: string | null
    redeemed: boolean
    redeemedByUser: string | null
    redeemedAt: string | null
    failedAttempts: number
  }>
  premiumHistory: Array<{
    id: string
    userId?: string
    type: string
    meta: Record<string, unknown>
    createdAt: string
  }>
}

const emptyDb = (): Db => ({
  users: [],
  codes: [],
  premiumHistory: [],
})

declare global {
  // eslint-disable-next-line no-var
  var __premium_db: Db | undefined
}

function getMemoryDb(): Db {
  if (typeof globalThis.__premium_db === "undefined") {
    globalThis.__premium_db = emptyDb()
  }
  return globalThis.__premium_db
}

export function loadDb(): Db {
  return getMemoryDb()
}

export function saveDb(db: Db): void {
  globalThis.__premium_db = db
}
