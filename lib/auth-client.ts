const USERS_KEY = "auth_users"
const SESSION_KEY = "auth_session"

export type User = {
  id: string
  email: string
  name: string
  createdAt: string
  isLifetimePremium?: boolean
}

type StoredUser = {
  id: string
  email: string
  name: string
  createdAt: string
  passwordHash: string
  isLifetimePremium?: boolean
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode("나눠줌-salt-" + password)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
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
  const normalized = email.trim().toLowerCase()
  if (!normalized || !password.trim() || !name.trim()) {
    return { error: "이메일, 비밀번호, 이름을 모두 입력해주세요." }
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다." }
  }
  const users = getUsers()
  if (users.some((u) => u.email === normalized)) {
    return { error: "이미 사용 중인 이메일입니다." }
  }
  const id = crypto.randomUUID()
  const user: User = {
    id,
    email: normalized,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    isLifetimePremium: false,
  }
  const passwordHash = await hashPassword(password)
  setUsers([...users, { ...user, passwordHash }])
  setSession(user)
  return { user }
}

export async function login(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  const normalized = email.trim().toLowerCase()
  const users = getUsers()
  const stored = users.find((u) => u.email === normalized)
  if (!stored) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." }
  }
  const hash = await hashPassword(password)
  if (hash !== stored.passwordHash) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." }
  }
  
  // 로그인 전에 레디임한 프리미엄 코드가 있으면 계정에 연결
  const redeemedCode = localStorage.getItem("premium_code_redeemed")
  if (redeemedCode && !stored.isLifetimePremium) {
    stored.isLifetimePremium = true
    localStorage.removeItem("premium_code_redeemed")
    setUsers(users)
  }
  
  const user: User = {
    id: stored.id,
    email: stored.email,
    name: stored.name,
    createdAt: stored.createdAt,
    isLifetimePremium: stored.isLifetimePremium || false,
  }
  setSession(user)
  return { user }
}

export function logout(): void {
  setSession(null)
}

// 코드 레디임 (백엔드 서버와 연동)
export async function redeemPremiumCode(
  code: string
): Promise<{ success?: boolean; error?: string; user?: User }> {
  const normalizedCode = code.replace(/[^A-Z0-9]/gi, "").toUpperCase()
  if (normalizedCode.length !== 8) {
    return { error: "코드는 8자리여야 합니다." }
  }

  try {
    // 백엔드 서버로 코드 레디임 요청
    let response
    try {
      // 먼저 Next.js API 라우트 시도
      response = await fetch("/api/premium/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalizedCode }),
      })
    } catch (e) {
      // 실패하면 백엔드 서버(포트 4000)로 시도
      response = await fetch("http://localhost:4000/premium/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: normalizedCode }),
      })
    }

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || "코드가 유효하지 않거나 이미 사용되었습니다." }
    }

    // 성공 시 사용자 정보 업데이트 (로그인한 경우)
    const user = getSession()
    if (user) {
      const users = getUsers()
      const storedUser = users.find((u) => u.id === user.id)
      if (storedUser) {
        storedUser.isLifetimePremium = true
        setUsers(users)
        const updatedUser: User = {
          ...user,
          isLifetimePremium: true,
        }
        setSession(updatedUser)
        return { success: true, user: updatedUser }
      }
    } else {
      // 로그인하지 않은 경우, 임시로 프리미엄 상태를 localStorage에 저장
      // 나중에 로그인하면 계정에 연결됨
      localStorage.setItem("premium_code_redeemed", normalizedCode)
    }

    return { success: true }
  } catch (err) {
    return { error: "코드 레디임 중 오류가 발생했습니다." }
  }
}
