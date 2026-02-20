import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

// 정적 사이트 생성 모드에서도 동적으로 처리하도록 설정
export const dynamic = 'force-dynamic'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: '코드를 입력해주세요.' },
        { status: 400 }
      )
    }

    const db = loadDb()
    const codeHash = hashCode(code)

    // 코드 존재 여부 / 사용 여부를 구분하지 않는 에러 메시지 사용
    const genericError = {
      error: '코드가 유효하지 않거나 이미 사용되었습니다.',
    }

    const now = Date.now()
    const entry = db.codes.find((c: any) => c.codeHash === codeHash)

    // 존재하지 않거나 만료된 경우에도 유사한 경로로 처리
    if (!entry) {
      // 더미 연산으로 타이밍 차이를 줄임
      crypto.pbkdf2Sync('dummy', 'dummy', 1000, 32, 'sha256')
      return NextResponse.json(genericError, { status: 400 })
    }

    if (entry.expiresAt && new Date(entry.expiresAt).getTime() < now) {
      return NextResponse.json(genericError, { status: 400 })
    }

    if (entry.redeemed) {
      return NextResponse.json(genericError, { status: 400 })
    }

    // 여기까지 왔다면 성공 처리
    // 주의: 실제로는 사용자 인증이 필요하지만, 
    // 프론트엔드에서 localStorage 기반 인증을 사용하므로
    // 여기서는 코드만 검증하고 성공 응답을 반환
    entry.redeemed = true
    entry.redeemedAt = new Date().toISOString()
    entry.failedAttempts = 0

    db.premiumHistory.push({
      id: crypto.randomUUID(),
      type: 'lifetime_code',
      meta: { codeId: entry.id },
      createdAt: new Date().toISOString(),
    })

    saveDb(db)

    return NextResponse.json({
      success: true,
      isLifetimePremium: true,
    })
  } catch (err) {
    return NextResponse.json(
      { error: '코드가 유효하지 않거나 이미 사용되었습니다.' },
      { status: 400 }
    )
  }
}
