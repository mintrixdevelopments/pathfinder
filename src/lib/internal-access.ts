import { createHash, timingSafeEqual } from "node:crypto";
import { redisDelete, redisGet, redisSet } from "./redis";

function accessKey(email: string): string {
  return `pf:internal:${email.trim().toLowerCase()}`;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function configuredKey(): string | null {
  const value = process.env.PATHFINDER_INTERNAL_KEY?.trim();
  return value && value.length >= 12 ? value : null;
}

function keyFingerprint(key: string): string {
  return digest(`pathfinder-internal:${key}`).toString("base64url");
}

export function internalAccessConfigured(): boolean {
  return configuredKey() !== null;
}

export async function hasInternalAccess(email: string): Promise<boolean> {
  const key = configuredKey();
  if (!key) return false;
  const stored = await redisGet(accessKey(email));
  return stored === keyFingerprint(key);
}

export async function activateInternalAccess(email: string, submittedKey: string): Promise<boolean> {
  const key = configuredKey();
  if (!key) throw new Error("ACCESS_NOT_CONFIGURED");

  const expected = digest(key);
  const submitted = digest(submittedKey.trim());
  if (!timingSafeEqual(expected, submitted)) return false;

  await redisSet(accessKey(email), keyFingerprint(key));
  return true;
}

export async function disableInternalAccess(email: string): Promise<void> {
  await redisDelete(accessKey(email));
}
