const USERS_KEY = "auth_users"
const SESSION_KEY = "auth_session"

export type User = {
  id: string
  email: string
  name: string
  createdAt: string
}

type StoredUser = {
  id: string
  email: string
  name: string
  createdAt: string
  passwordHash: string
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
  const user: User = {
    id: stored.id,
    email: stored.email,
    name: stored.name,
    createdAt: stored.createdAt,
  }
  setSession(user)
  return { user }
}

export function logout(): void {
  setSession(null)
}
