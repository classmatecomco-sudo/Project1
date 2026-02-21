import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/supabase/auth-api"
import { createServiceClient } from "@/lib/supabase/server"

const DAILY_FREE_LIMIT = 5

export async function POST(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const service = createServiceClient()

  const { data: profile, error } = await service
    .from("profiles")
    .select("free_usage_count, free_usage_date")
    .eq("id", authUser.id)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116: row not found
    return NextResponse.json({ error: "사용자 정보를 불러오지 못했습니다." }, { status: 500 })
  }

  const rawCount = profile?.free_usage_count ?? 0
  const rawDate = profile?.free_usage_date ?? null
  const lastDate = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : null

  const usedToday = lastDate === today ? rawCount : 0

  if (usedToday >= DAILY_FREE_LIMIT) {
    return NextResponse.json(
      { error: "오늘 무료 사용 횟수(5회)를 모두 사용했습니다.", usedToday, remaining: 0 },
      { status: 429 }
    )
  }

  const newCount = usedToday + 1

  const { error: updateError } = await service
    .from("profiles")
    .update({
      free_usage_count: newCount,
      free_usage_date: today,
    })
    .eq("id", authUser.id)

  if (updateError) {
    return NextResponse.json({ error: "사용량을 업데이트하지 못했습니다." }, { status: 500 })
  }

  const remaining = Math.max(0, DAILY_FREE_LIMIT - newCount)

  return NextResponse.json({
    success: true,
    limit: DAILY_FREE_LIMIT,
    usedToday: newCount,
    remaining,
  })
}

