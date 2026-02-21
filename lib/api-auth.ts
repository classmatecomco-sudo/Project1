import * as crypto from "crypto"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-prod"

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, "sha512")
    .toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const computed = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, "sha512")
    .toString("hex")
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(computed, "hex"))
}

export function signToken(payload: { sub: string; email: string; isLifetimePremium: boolean }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { sub: string; email: string; isLifetimePremium: boolean } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; isLifetimePremium: boolean }
    return payload
  } catch {
    return null
  }
}

export function normalizeCode(code: string): string {
  return code.replace(/[^A-Z0-9]/gi, "").toUpperCase()
}

const CODE_HASH_SECRET = process.env.CODE_HASH_SECRET || "change-this-code-secret-in-prod"

export function hashCode(plain: string): string {
  const normalized = normalizeCode(plain)
  return crypto.createHmac("sha256", CODE_HASH_SECRET).update(normalized).digest("hex")
}

export function generateRedeemCode(length = 8): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = crypto.randomBytes(length)
  let code = ""
  for (let i = 0; i < length; i++) code += charset[bytes[i] % charset.length]
  return code.match(/.{1,4}/g)!.join("-")
}
