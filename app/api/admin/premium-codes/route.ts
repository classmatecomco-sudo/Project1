import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

// 백엔드 서버와 동일한 DB 경로 사용
const DB_PATH = path.join(process.cwd(), 'backend', 'data.json')
const CODE_HASH_SECRET =
  process.env.CODE_HASH_SECRET || 'change-this-code-secret-in-prod'

function loadDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { users: [], codes: [], premiumHistory: [] }
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8')
    return raw ? JSON.parse(raw) : { users: [], codes: [], premiumHistory: [] }
  } catch {
    return { users: [], codes: [], premiumHistory: [] }
  }
}

function saveDb(db: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
}

// 코드 생성 (8자리)
function generateRedeemCode(length = 8) {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(length)
  let code = ''
  for (let i = 0; i < length; i++) {
    code += charset[bytes[i] % charset.length]
  }
  // 8자리 코드는 4-4 형식으로 표시
  return code.match(/.{1,4}/g)?.join('-') || code
}

function normalizeCode(code: string) {
  return code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
}

function hashCode(plain: string) {
  const normalized = normalizeCode(plain)
  return crypto
    .createHmac('sha256', CODE_HASH_SECRET)
    .update(normalized)
    .digest('hex')
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const countParam = searchParams.get('count')
  const n = Number(countParam) || 1

  if (n <= 0 || n > 1000) {
    return NextResponse.json(
      { error: 'count는 1 이상 1000 이하 정수여야 합니다.' },
      { status: 400 }
    )
  }

  const db = loadDb()
  const created = []

  for (let i = 0; i < n; i++) {
    const plain = generateRedeemCode(8)
    const codeHash = hashCode(plain)
    const id = crypto.randomUUID()
    db.codes.push({
      id,
      codeHash,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      redeemed: false,
      redeemedByUser: null,
      redeemedAt: null,
      failedAttempts: 0,
    })
    created.push({ id, code: plain })
  }

  saveDb(db)

  return NextResponse.json({ codes: created })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { count } = body
  const n = Number(count) || 1

  if (n <= 0 || n > 1000) {
    return NextResponse.json(
      { error: 'count는 1 이상 1000 이하 정수여야 합니다.' },
      { status: 400 }
    )
  }

  const db = loadDb()
  const created = []

  for (let i = 0; i < n; i++) {
    const plain = generateRedeemCode(8)
    const codeHash = hashCode(plain)
    const id = crypto.randomUUID()
    db.codes.push({
      id,
      codeHash,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      redeemed: false,
      redeemedByUser: null,
      redeemedAt: null,
      failedAttempts: 0,
    })
    created.push({ id, code: plain })
  }

  saveDb(db)

  return NextResponse.json({ codes: created })
}
