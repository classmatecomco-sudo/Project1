import { NextRequest, NextResponse } from "next/server"
import * as crypto from "crypto"
import { loadDb, saveDb } from "@/lib/api-db"
import { verifyToken, signToken, hashCode } from "@/lib/api-auth"

const genericError = { error: "코드가 유효하지 않거나 이미 사용되었습니다." }

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
  }
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: "유효하지 않은 토큰입니다." }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const code = body?.code
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "코드를 입력해주세요." }, { status: 400 })
  }
  const db = loadDb()
  const user = db.users.find((u) => u.id === payload.sub)
  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 })
  }
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
  entry.redeemedByUser = user.id
  entry.redeemedAt = new Date().toISOString()
  entry.failedAttempts = 0
  user.isLifetimePremium = true
  db.premiumHistory.push({
    id: crypto.randomUUID(),
    userId: user.id,
    type: "lifetime_code",
    meta: { codeId: entry.id },
    createdAt: new Date().toISOString(),
  })
  saveDb(db)
  const newToken = signToken({
    sub: user.id,
    email: user.email,
    isLifetimePremium: true,
  })
  return NextResponse.json({ success: true, isLifetimePremium: true, token: newToken })
}
