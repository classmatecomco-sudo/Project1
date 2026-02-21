import { createClient } from "@/lib/supabase/client"

const SESSION_KEY = "auth_session"
const TOKEN_KEY = "auth_token"
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ""

function apiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : `/api${path}`
}

export type User = {
  id: string
  email: string
  name: string
  createdAt: string
  isLifetimePremium: boolean
}

function saveSessionAndToken(user: User | null, token: string | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
    if (token) localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    const data = raw ? JSON.parse(raw) : null
    return data?.user ?? null
  } catch {
    return null
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

function setSession(user: User | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
  } else {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }
}

function mapToUser(
  id: string,
  email: string | undefined,
  createdAt: string,
  profile: { name: string | null; is_lifetime_premium: boolean } | null
): User {
  return {
    id,
    email: email ?? "",
    name: profile?.name ?? "",
    createdAt,
    isLifetimePremium: profile?.is_lifetime_premium ?? false,
  }
}

/** Supabase 세션과 프로필을 기반으로 앱 세션 동기화 (초기 로드·auth 변경 시 사용) */
export async function syncSessionFromSupabase(): Promise<User | null> {
  const supabase = createClient()
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  if (sessionError || !session?.user) {
    setSession(null)
    return null
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, is_lifetime_premium")
    .eq("id", session.user.id)
    .single()
  const user = mapToUser(
    session.user.id,
    session.user.email,
    session.user.created_at ?? new Date().toISOString(),
    profile
  )
  saveSessionAndToken(user, session.access_token)
  return user
}

export async function signup(
  email: string,
  password: string,
  name: string
): Promise<{ user?: User; error?: string }> {
  const supabase = createClient()
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !password || !name.trim()) {
    return { error: "이메일, 비밀번호, 이름을 모두 입력해주세요." }
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다." }
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: { data: { name: name.trim() } },
  })

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "이미 사용 중인 이메일입니다." }
    }
    return { error: authError.message || "회원가입에 실패했습니다." }
  }

  if (!authData.user) {
    return { error: "회원가입에 실패했습니다." }
  }

  await supabase.from("profiles").upsert({
    id: authData.user.id,
    name: name.trim(),
    is_lifetime_premium: false,
  }, { onConflict: "id" })

  const user = mapToUser(
    authData.user.id,
    authData.user.email,
    authData.user.created_at ?? new Date().toISOString(),
    { name: name.trim(), is_lifetime_premium: false }
  )
  const token = authData.session?.access_token ?? null
  saveSessionAndToken(user, token)
  return { user }
}

export async function login(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  const supabase = createClient()
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  })

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "이메일 또는 비밀번호가 올바르지 않습니다." }
    }
    return { error: error.message || "로그인에 실패했습니다." }
  }

  if (!data.user || !data.session) {
    return { error: "로그인에 실패했습니다." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, is_lifetime_premium")
    .eq("id", data.user.id)
    .single()

  const user = mapToUser(
    data.user.id,
    data.user.email,
    data.user.created_at ?? new Date().toISOString(),
    profile
  )
  saveSessionAndToken(user, data.session.access_token)
  return { user }
}

export function logout(): void {
  if (typeof window === "undefined") return
  createClient()
    .auth.signOut()
    .finally(() => {
      setSession(null)
    })
  setSession(null)
}

/** 로그인 상태에서 프로필/프리미엄 갱신 후 세션 업데이트 */
export async function refresh(): Promise<User | null> {
  return syncSessionFromSupabase()
}

// 코드 레디임 (백엔드/API와 연동)
export async function redeemPremiumCode(
  code: string
): Promise<{ success?: boolean; error?: string; user?: User }> {
  const user = getSession()
  const token = getToken()
  if (!user || !token) {
    return { error: "프리미엄 코드를 적용하려면 로그인해야 합니다." }
  }

  const normalizedCode = code.replace(/[^A-Z0-9]/gi, "").toUpperCase()
  if (normalizedCode.length !== 8) {
    return { error: "코드는 8자리여야 합니다." }
  }

  try {
    const response = await fetch(apiUrl("/premium/redeem"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code: normalizedCode }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || "코드가 유효하지 않거나 이미 사용되었습니다." }
    }

    if (data.token) localStorage.setItem(TOKEN_KEY, data.token)
    const updatedUser: User = { ...user, isLifetimePremium: true }
    setSession(updatedUser)

    return { success: true, user: updatedUser }
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
      return { error: "백엔드 서버에 연결할 수 없습니다. 터미널에서 'npm run server'를 실행해주세요." }
    }
    return { error: "서버에 연결할 수 없습니다. (백엔드 실행 필요)" }
  }
}
