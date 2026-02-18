const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// 간단한 파일 기반 "DB" (개인 프로젝트용)
const DB_PATH = path.join(__dirname, "data.json");
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-prod";
const CODE_HASH_SECRET =
  process.env.CODE_HASH_SECRET || "change-this-code-secret-in-prod";

function loadDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { users: [], codes: [], premiumHistory: [] };
    }
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return raw ? JSON.parse(raw) : { users: [], codes: [], premiumHistory: [] };
  } catch {
    return { users: [], codes: [], premiumHistory: [] };
  }
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

// 비밀번호 해시 (PBKDF2)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const computed = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, "sha512")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(computed, "hex"));
}

// JWT helpers
const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      isLifetimePremium: !!user.isLifetimePremium,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "인증이 필요합니다." });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, isLifetimePremium: payload.isLifetimePremium };
    next();
  } catch {
    return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
  }
}

// 코드 생성
function generateRedeemCode(length = 16) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += charset[bytes[i] % charset.length];
  }
  return code.match(/.{1,4}/g).join("-");
}

function normalizeCode(code) {
  return code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
}

function hashCode(plain) {
  const normalized = normalizeCode(plain);
  return crypto
    .createHmac("sha256", CODE_HASH_SECRET)
    .update(normalized)
    .digest("hex");
}

// 브루트포스 방어를 위한 간단한 rate limit (메모리 기반)
const rateLimitStore = new Map(); // key: ip, value: { count, resetAt }
const MAX_ATTEMPTS_PER_MIN = 10;

function redeemRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + 60_000 });
    return next();
  }
  if (entry.count >= MAX_ATTEMPTS_PER_MIN) {
    return res
      .status(429)
      .json({ error: "시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요." });
  }
  entry.count += 1;
  rateLimitStore.set(ip, entry);
  next();
}

const app = express();
app.use(express.json());

// 회원가입
app.post("/auth/signup", (req, res) => {
  const { email, password, name } = req.body || {};
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!normalizedEmail || !password || !name) {
    return res
      .status(400)
      .json({ error: "이메일, 비밀번호, 이름을 모두 입력해주세요." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "비밀번호는 6자 이상이어야 합니다." });
  }
  const db = loadDb();
  if (db.users.some((u) => u.email === normalizedEmail)) {
    return res.status(400).json({ error: "이미 사용 중인 이메일입니다." });
  }
  const id = crypto.randomUUID();
  const user = {
    id,
    email: normalizedEmail,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
    isLifetimePremium: false,
  };
  db.users.push(user);
  saveDb(db);
  const token = signToken(user);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      isLifetimePremium: user.isLifetimePremium,
    },
    token,
  });
});

// 로그인
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = (email || "").trim().toLowerCase();
  const db = loadDb();
  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return res
      .status(400)
      .json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }
  if (!verifyPassword(password || "", user.passwordHash)) {
    return res
      .status(400)
      .json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }
  const token = signToken(user);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      isLifetimePremium: user.isLifetimePremium,
    },
    token,
  });
});

// 현재 유저 정보
app.get("/me", authMiddleware, (req, res) => {
  const db = loadDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    isLifetimePremium: user.isLifetimePremium,
  });
});

// 프리미엄 상태
app.get("/premium/status", authMiddleware, (req, res) => {
  const db = loadDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }
  res.json({ isLifetimePremium: !!user.isLifetimePremium });
});

// 코드 레디임
app.post("/premium/redeem", authMiddleware, redeemRateLimit, (req, res) => {
  const { code } = req.body || {};
  if (!code || typeof code !== "string") {
    return res
      .status(400)
      .json({ error: "코드를 입력해주세요." });
  }
  const db = loadDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }

  const codeHash = hashCode(code);

  // 코드 존재 여부 / 사용 여부를 구분하지 않는 에러 메시지 사용
  const genericError = {
    error: "코드가 유효하지 않거나 이미 사용되었습니다.",
  };

  const now = Date.now();
  const entry = db.codes.find((c) => c.codeHash === codeHash);

  // 존재하지 않거나 만료된 경우에도 유사한 경로로 처리
  if (!entry) {
    // 더미 연산으로 타이밍 차이를 줄임
    crypto.pbkdf2Sync("dummy", "dummy", 1000, 32, "sha256");
    return res.status(400).json(genericError);
  }

  if (entry.expiresAt && new Date(entry.expiresAt).getTime() < now) {
    return res.status(400).json(genericError);
  }

  if (entry.redeemed) {
    return res.status(400).json(genericError);
  }

  // 간단한 per-code 실패 횟수 관리 (선택)
  entry.failedAttempts = entry.failedAttempts || 0;

  // 여기까지 왔다면 성공 처리 (트랜잭션처럼 순서 보장)
  entry.redeemed = true;
  entry.redeemedByUser = user.id;
  entry.redeemedAt = new Date().toISOString();
  entry.failedAttempts = 0;

  user.isLifetimePremium = true;

  db.premiumHistory.push({
    id: crypto.randomUUID(),
    userId: user.id,
    type: "lifetime_code",
    meta: { codeId: entry.id },
    createdAt: new Date().toISOString(),
  });

  saveDb(db);

  const newToken = signToken(user);

  res.json({
    success: true,
    isLifetimePremium: true,
    token: newToken,
  });
});

// 관리자용 코드 생성 (개인 프로젝트에서는 서버 내부에서만 호출)
app.post("/admin/premium-codes", (req, res) => {
  const { count } = req.body || {};
  const n = Number(count) || 1;
  if (n <= 0 || n > 1000) {
    return res
      .status(400)
      .json({ error: "count는 1 이상 1000 이하 정수여야 합니다." });
  }
  const db = loadDb();
  const created = [];
  for (let i = 0; i < n; i++) {
    const plain = generateRedeemCode(16);
    const codeHash = hashCode(plain);
    const id = crypto.randomUUID();
    db.codes.push({
      id,
      codeHash,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      redeemed: false,
      redeemedByUser: null,
      redeemedAt: null,
      failedAttempts: 0,
    });
    created.push({ id, code: plain });
  }
  saveDb(db);
  res.json({
    codes: created,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Lifetime premium server listening on http://localhost:${PORT}`);
});

