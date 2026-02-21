import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/supabase/auth-api"

const DAILY_FREE_LIMIT = 5

export async function GET(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
  }

  const profile = authUser.profile
  const rawCount = profile?.free_usage_count ?? 0
  const rawDate = profile?.free_usage_date ?? null

  const today = new Date().toISOString().slice(0, 10)
  const lastDate = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : null

  const usedToday = lastDate === today ? rawCount : 0
  const remaining = Math.max(0, DAILY_FREE_LIMIT - usedToday)

  return NextResponse.json({
    limit: DAILY_FREE_LIMIT,
    usedToday,
    remaining,
    date: today,
  })
}

