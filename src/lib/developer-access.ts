import { createHash, timingSafeEqual } from "node:crypto";
import { redisDelete, redisGet, redisSet } from "./redis";

function developerKey(email: string): string {
  return `pf:developer:${email.trim().toLowerCase()}`;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function configuredCode(): string | null {
  const value = process.env.PATHFINDER_DEVELOPER_CODE?.trim();
  return value && value.length >= 8 ? value : null;
}

function codeFingerprint(code: string): string {
  return digest(`pathfinder-developer:${code}`).toString("base64url");
}

export function developerAccessConfigured(): boolean {
  return configuredCode() !== null;
}

export async function hasDeveloperAccess(email: string): Promise<boolean> {
  const code = configuredCode();
  if (!code) return false;
  const stored = await redisGet(developerKey(email));
  return stored === codeFingerprint(code);
}

export async function activateDeveloperAccess(email: string, submittedCode: string): Promise<boolean> {
  const code = configuredCode();
  if (!code) throw new Error("DEVELOPER_ACCESS_NOT_CONFIGURED");

  const expected = digest(code);
  const submitted = digest(submittedCode.trim());
  if (!timingSafeEqual(expected, submitted)) return false;

  await redisSet(developerKey(email), codeFingerprint(code));
  return true;
}

export async function disableDeveloperAccess(email: string): Promise<void> {
  await redisDelete(developerKey(email));
}
