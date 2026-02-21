import { NextRequest, NextResponse } from "next/server"
import { loadDb } from "@/lib/api-db"
import { verifyToken } from "@/lib/api-auth"

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
  }
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: "유효하지 않은 토큰입니다." }, { status: 401 })
  }
  const db = loadDb()
  const user = db.users.find((u) => u.id === payload.sub)
  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 })
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    isLifetimePremium: user.isLifetimePremium,
  })
}
