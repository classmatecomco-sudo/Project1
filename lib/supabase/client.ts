import { createBrowserClient } from "@supabase/ssr"

/** 환경 변수가 없으면 null 반환 (Vercel 등에서 미설정 시 앱이 크래시하지 않도록) */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createBrowserClient(url, anonKey)
}
