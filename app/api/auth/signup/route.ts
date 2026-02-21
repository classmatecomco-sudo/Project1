import { NextRequest, NextResponse } from "next/server"
import * as crypto from "crypto"
import { loadDb, saveDb } from "@/lib/api-db"
import { hashPassword, signToken } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, password, name } = body
  const normalizedEmail = (email || "").trim().toLowerCase()
  if (!normalizedEmail || !password || !name) {
    return NextResponse.json(
      { error: "이메일, 비밀번호, 이름을 모두 입력해주세요." },
      { status: 400 }
    )
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 })
  }
  const db = loadDb()
  if (db.users.some((u) => u.email === normalizedEmail)) {
    return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 400 })
  }
  const id = crypto.randomUUID()
  const user = {
    id,
    email: normalizedEmail,
    name: String(name).trim(),
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(String(password)),
    isLifetimePremium: false,
  }
  db.users.push(user)
  saveDb(db)
  const token = signToken({
    sub: user.id,
    email: user.email,
    isLifetimePremium: user.isLifetimePremium,
  })
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      isLifetimePremium: user.isLifetimePremium,
    },
    token,
  })
}
