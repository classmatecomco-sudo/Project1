import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/** API 라우트 등 서버에서 사용. anon key로 JWT 검증용 */
export function createClient() {
  if (!url || !anonKey) throw new Error("Supabase URL/Anon Key가 설정되지 않았습니다.")
  return createSupabaseClient(url, anonKey)
}

/** 프로필 업데이트 등 RLS를 우회할 때만 사용 (예: 프리미엄 코드 적용) */
export function createServiceClient() {
  if (!url || !serviceKey) throw new Error("Supabase URL/Service Role Key가 설정되지 않았습니다.")
  return createSupabaseClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

export type Profile = {
  id: string
  name: string | null
  is_lifetime_premium: boolean
  created_at: string
  updated_at: string
  free_usage_count: number
  free_usage_date: string | null
}
