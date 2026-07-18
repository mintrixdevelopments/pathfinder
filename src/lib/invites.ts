import { redisEval, redisGet } from "./redis";
import { normalizeEmail } from "./security";

const REFERRAL_CREDITS = 2;
const TEN_INVITE_BONUS = 5;

const REDEEM_SCRIPT = `
if redis.call('EXISTS', KEYS[1]) == 1 then
  return {0, tonumber(redis.call('GET', KEYS[2]) or '0'), tonumber(redis.call('GET', KEYS[3]) or '0')}
end

redis.call('SET', KEYS[1], ARGV[1])
local count = redis.call('INCR', KEYS[2])
local bonus = redis.call('INCRBY', KEYS[3], ARGV[2])
if count == 10 then
  bonus = redis.call('INCRBY', KEYS[3], ARGV[3])
end
return {1, count, bonus}
`;

export async function redeemInviteForEmail(
  emailInput: string,
  codeInput: string
): Promise<{ ok: boolean; alreadyRedeemed: boolean; inviteCount: number; bonusCredits: number }> {
  const email = normalizeEmail(emailInput);
  const code = codeInput.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{6,12}$/.test(code)) throw new Error("INVALID_CODE");

  const ownerRaw = await redisGet(`pf:codeowner:${code}`);
  const ownerEmail = ownerRaw ? normalizeEmail(ownerRaw) : "";
  if (!ownerEmail) throw new Error("CODE_NOT_FOUND");
  if (ownerEmail === email) throw new Error("SELF_REFERRAL");

  const result = await redisEval<number[]>(
    REDEEM_SCRIPT,
    [
      `pf:redeemed:${email}`,
      `pf:invitecount:${ownerEmail}`,
      `pf:bonuscredits:${ownerEmail}`,
    ],
    [code, REFERRAL_CREDITS, TEN_INVITE_BONUS]
  );

  return {
    ok: Number(result[0]) === 1,
    alreadyRedeemed: Number(result[0]) !== 1,
    inviteCount: Number(result[1]),
    bonusCredits: Number(result[2]),
  };
}
