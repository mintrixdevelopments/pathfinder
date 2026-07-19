import { createHash, randomBytes, randomInt } from "node:crypto";
import { redisEval, redisExpire, redisGet, redisGetDelete, redisSetEx } from "./redis";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PAIRING_TTL_SECONDS = 10 * 60;
const SESSION_TTL_SECONDS = 90 * 24 * 60 * 60;

interface PairingRecord {
  email: string;
  createdAt: string;
}

export interface PluginSession {
  email: string;
  installationId: string;
  createdAt: string;
  lastSeenAt: string;
  placeId?: number;
  gameId?: number;
  placeName?: string;
}

function pairingKey(code: string): string {
  return `pf:plugin-pair:${code}`;
}

function sessionKey(token: string): string {
  const digest = createHash("sha256").update(token).digest("base64url");
  return `pf:plugin-session:${digest}`;
}

function generateCode(): string {
  return Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
}

export async function createPluginPairingCode(email: string): Promise<{ code: string; expiresIn: number }> {
  const record: PairingRecord = {
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateCode();
    const created = await redisEval<number>(
      `if redis.call("EXISTS", KEYS[1]) == 1 then return 0 end
       redis.call("SET", KEYS[1], ARGV[1], "EX", ARGV[2])
       return 1`,
      [pairingKey(code)],
      [JSON.stringify(record), PAIRING_TTL_SECONDS]
    );
    if (Number(created) === 1) return { code, expiresIn: PAIRING_TTL_SECONDS };
  }

  throw new Error("PAIRING_CODE_UNAVAILABLE");
}

export async function claimPluginPairingCode(
  code: string,
  installationId: string
): Promise<{ token: string; session: PluginSession } | null> {
  const raw = await redisGetDelete(pairingKey(code.trim().toUpperCase()));
  if (!raw) return null;

  let record: PairingRecord;
  try {
    record = JSON.parse(raw) as PairingRecord;
  } catch {
    return null;
  }
  if (!record.email) return null;

  const token = `pfp_${randomBytes(32).toString("base64url")}`;
  const now = new Date().toISOString();
  const session: PluginSession = {
    email: record.email,
    installationId,
    createdAt: now,
    lastSeenAt: now,
  };
  await redisSetEx(sessionKey(token), SESSION_TTL_SECONDS, JSON.stringify(session));
  return { token, session };
}

export async function getPluginSession(request: Request): Promise<{ token: string; session: PluginSession } | null> {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!/^pfp_[A-Za-z0-9_-]{40,}$/.test(token)) return null;

  const raw = await redisGet(sessionKey(token));
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as PluginSession;
    if (!session.email || !session.installationId) return null;
    await redisExpire(sessionKey(token), SESSION_TTL_SECONDS).catch(() => false);
    return { token, session };
  } catch {
    return null;
  }
}

export async function updatePluginSession(token: string, session: PluginSession): Promise<void> {
  await redisSetEx(sessionKey(token), SESSION_TTL_SECONDS, JSON.stringify(session));
}
