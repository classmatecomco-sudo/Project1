import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/supabase/server"

export type AuthUser = {
  id: string
  email: string
  profile: Profile | null
}

/** API 라우트에서 Authorization Bearer 토큰으로 Supabase 사용자 + 프로필 조회 */
export async function getAuthUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) return null

  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token)
  if (userError || !user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, is_lifetime_premium, created_at, updated_at, free_usage_count, free_usage_date")
    .eq("id", user.id)
    .single()

  return {
    id: user.id,
    email: user.email ?? "",
    profile: profile as Profile | null,
  }
}
