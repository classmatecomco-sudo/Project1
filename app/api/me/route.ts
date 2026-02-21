import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/supabase/auth-api"

export async function GET(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
  }
  return NextResponse.json({
    id: authUser.id,
    email: authUser.email,
    name: authUser.profile?.name ?? "",
    createdAt: authUser.profile?.created_at ?? new Date().toISOString(),
    isLifetimePremium: authUser.profile?.is_lifetime_premium ?? false,
  })
}
