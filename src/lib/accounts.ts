import { randomUUID } from "node:crypto";
import { redisGet, redisGetDelete, redisSet, redisSetEx } from "./redis";
import {
  createToken,
  digestToken,
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "./security";

export interface PathfinderUser {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  emailVerified: boolean;
  googleConnected: boolean;
  createdAt: string;
  updatedAt: string;
  termsAcceptedAt?: string;
  pendingInviteCode?: string;
}

const VERIFY_TTL_SECONDS = 60 * 60;
const RESET_TTL_SECONDS = 30 * 60;

function userKey(email: string) {
  return `pf:user:${normalizeEmail(email)}`;
}

export async function getUser(email: string): Promise<PathfinderUser | null> {
  const raw = await redisGet(userKey(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PathfinderUser;
  } catch {
    return null;
  }
}

export async function saveUser(user: PathfinderUser): Promise<void> {
  user.updatedAt = new Date().toISOString();
  await redisSet(userKey(user.email), JSON.stringify(user));
}

export async function ensureGoogleUser(input: {
  email: string;
  name?: string | null;
}): Promise<PathfinderUser> {
  const email = normalizeEmail(input.email);
  const existing = await getUser(email);
  if (existing) {
    existing.googleConnected = true;
    existing.emailVerified = true;
    if (!existing.name && input.name) existing.name = input.name.trim().slice(0, 80);
    await saveUser(existing);
    return existing;
  }

  const now = new Date().toISOString();
  const user: PathfinderUser = {
    id: randomUUID(),
    email,
    name: input.name?.trim().slice(0, 80) || email.split("@")[0],
    emailVerified: true,
    googleConnected: true,
    createdAt: now,
    updatedAt: now,
  };
  await saveUser(user);
  return user;
}

export async function createPendingEmailUser(input: {
  email: string;
  name: string;
  password: string;
  inviteCode?: string;
}): Promise<{ user: PathfinderUser; token: string }> {
  const email = normalizeEmail(input.email);
  const existing = await getUser(email);
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(input.password);

  const user: PathfinderUser = existing || {
    id: randomUUID(),
    email,
    name: input.name.trim().slice(0, 80),
    emailVerified: false,
    googleConnected: false,
    createdAt: now,
    updatedAt: now,
  };

  user.name = input.name.trim().slice(0, 80);
  user.passwordHash = passwordHash;
  user.termsAcceptedAt ||= now;
  if (input.inviteCode) user.pendingInviteCode = input.inviteCode.trim().toUpperCase();
  await saveUser(user);

  const { token, digest } = createToken();
  await redisSetEx(`pf:verify:${digest}`, VERIFY_TTL_SECONDS, email);
  return { user, token };
}

export async function verifyEmailToken(token: string): Promise<PathfinderUser | null> {
  const digest = digestToken(token);
  const key = `pf:verify:${digest}`;
  const email = await redisGetDelete(key);
  if (!email) return null;

  const user = await getUser(email);
  if (!user) return null;

  user.emailVerified = true;
  await saveUser(user);
  return user;
}

export async function authenticateEmailPassword(
  emailInput: string,
  password: string
): Promise<PathfinderUser | null> {
  const user = await getUser(emailInput);
  if (!user?.passwordHash || !user.emailVerified) return null;
  return (await verifyPassword(password, user.passwordHash)) ? user : null;
}

export async function createPasswordReset(emailInput: string): Promise<string | null> {
  const user = await getUser(emailInput);
  if (!user?.emailVerified || !user.passwordHash) return null;
  const { token, digest } = createToken();
  await redisSetEx(`pf:reset:${digest}`, RESET_TTL_SECONDS, user.email);
  return token;
}

export async function resetPasswordWithToken(
  token: string,
  password: string
): Promise<PathfinderUser | null> {
  const digest = digestToken(token);
  const key = `pf:reset:${digest}`;
  const email = await redisGetDelete(key);
  if (!email) return null;
  const user = await getUser(email);
  if (!user) return null;

  user.passwordHash = await hashPassword(password);
  await saveUser(user);
  return user;
}
