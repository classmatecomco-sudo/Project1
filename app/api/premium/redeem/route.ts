import { NextRequest, NextResponse } from "next/server"
import * as crypto from "crypto"
import { loadDb, saveDb } from "@/lib/api-db"
import { hashCode } from "@/lib/api-auth"
import { getAuthUserFromRequest } from "@/lib/supabase/auth-api"
import { createServiceClient } from "@/lib/supabase/server"

const genericError = { error: "코드가 유효하지 않거나 이미 사용되었습니다." }

export async function POST(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const code = body?.code
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "코드를 입력해주세요." }, { status: 400 })
  }

  const db = loadDb()
  const codeHash = hashCode(code)
  const entry = db.codes.find((c) => c.codeHash === codeHash)
  if (!entry) {
    crypto.pbkdf2Sync("dummy", "dummy", 1000, 32, "sha256")
    return NextResponse.json(genericError, { status: 400 })
  }
  if (entry.expiresAt && new Date(entry.expiresAt).getTime() < Date.now()) {
    return NextResponse.json(genericError, { status: 400 })
  }
  if (entry.redeemed) {
    return NextResponse.json(genericError, { status: 400 })
  }

  entry.redeemed = true
  entry.redeemedByUser = authUser.id
  entry.redeemedAt = new Date().toISOString()
  entry.failedAttempts = 0
  db.premiumHistory.push({
    id: crypto.randomUUID(),
    userId: authUser.id,
    type: "lifetime_code",
    meta: { codeId: entry.id },
    createdAt: new Date().toISOString(),
  })
  saveDb(db)

  const service = createServiceClient()
  await service.from("profiles").update({ is_lifetime_premium: true }).eq("id", authUser.id)

  return NextResponse.json({ success: true, isLifetimePremium: true })
}
