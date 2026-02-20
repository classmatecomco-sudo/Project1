const SESSION_KEY = "auth_session"
const TOKEN_KEY = "auth_token"
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

export type User = {
  id: string
  email: string
  name: string
  createdAt: string
  isLifetimePremium: boolean
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
  }
}

export async function signup(
  email: string,
  password: string,
  name: string
): Promise<{ user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { error: data.error || "회원가입에 실패했습니다." }

    const user: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      createdAt: data.user.createdAt,
      isLifetimePremium: !!data.user.isLifetimePremium,
    }
    localStorage.setItem(TOKEN_KEY, data.token)
    setSession(user)
    return { user }
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
      return { error: "백엔드 서버에 연결할 수 없습니다. 터미널에서 'npm run server'를 실행해주세요." }
    }
    return { error: "서버에 연결할 수 없습니다. (백엔드 실행 필요)" }
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { error: data.error || "로그인에 실패했습니다." }

    const user: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      createdAt: data.user.createdAt,
      isLifetimePremium: !!data.user.isLifetimePremium,
    }
    localStorage.setItem(TOKEN_KEY, data.token)
    setSession(user)
    return { user }
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
      return { error: "백엔드 서버에 연결할 수 없습니다. 터미널에서 'npm run server'를 실행해주세요." }
    }
    return { error: "서버에 연결할 수 없습니다. (백엔드 실행 필요)" }
  }
}

export function logout(): void {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY)
  setSession(null)
}

// 코드 레디임 (백엔드 서버와 연동)
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
    const response = await fetch(`${API_BASE}/premium/redeem`, {
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
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
      return { error: "백엔드 서버에 연결할 수 없습니다. 터미널에서 'npm run server'를 실행해주세요." }
    }
    return { error: "서버에 연결할 수 없습니다. (백엔드 실행 필요)" }
  }
}
