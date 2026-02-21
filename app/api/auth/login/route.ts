import { NextRequest, NextResponse } from "next/server"
import { loadDb } from "@/lib/api-db"
import { verifyPassword, signToken } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body
  const normalizedEmail = (email || "").trim().toLowerCase()
  const db = loadDb()
  const user = db.users.find((u) => u.email === normalizedEmail)
  if (!user) {
    return NextResponse.json(
      { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
      { status: 400 }
    )
  }
  if (!verifyPassword(String(password || ""), user.passwordHash)) {
    return NextResponse.json(
      { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
      { status: 400 }
    )
  }
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
