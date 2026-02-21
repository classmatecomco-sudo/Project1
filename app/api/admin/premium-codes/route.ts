import { NextRequest, NextResponse } from "next/server"
import * as crypto from "crypto"
import { loadDb, saveDb } from "@/lib/api-db"
import { generateRedeemCode, hashCode } from "@/lib/api-auth"

export async function GET(req: NextRequest) {
  const n = Math.min(1000, Math.max(1, Number(req.nextUrl.searchParams.get("count")) || 1))
  const db = loadDb()
  const created: Array<{ id: string; code: string }> = []
  for (let i = 0; i < n; i++) {
    const plain = generateRedeemCode(8)
    const codeHash = hashCode(plain)
    const id = crypto.randomUUID()
    db.codes.push({
      id,
      codeHash,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      redeemed: false,
      redeemedByUser: null,
      redeemedAt: null,
      failedAttempts: 0,
    })
    created.push({ id, code: plain })
  }
  saveDb(db)
  return NextResponse.json({ codes: created })
}
