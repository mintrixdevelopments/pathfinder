import { auth } from "../../../../auth";
import { NextResponse } from "next/server";
import { redisEval, redisGet } from "../../../../lib/redis";

const REDEEM_SCRIPT = `
if redis.call('EXISTS', KEYS[1]) == 1 then
  return {0, tonumber(redis.call('GET', KEYS[2]) or '0')}
end

redis.call('SET', KEYS[1], ARGV[1])
local count = redis.call('INCR', KEYS[2])
redis.call('INCR', KEYS[3])
if count == 10 then
  redis.call('INCR', KEYS[3])
end
return {1, count}
`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!/^[A-Z0-9_-]{6,12}$/.test(code)) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
  }

  const email = session.user.email.toLowerCase();

  try {
    const ownerRaw = await redisGet(`pf:codeowner:${code}`);
    const ownerEmail = ownerRaw?.toLowerCase();
    if (!ownerEmail) {
      return NextResponse.json({ error: "Invite code not found" }, { status: 404 });
    }
    if (ownerEmail === email) {
      return NextResponse.json({ error: "You cannot redeem your own invite link" }, { status: 400 });
    }

    const result = await redisEval<number[]>(
      REDEEM_SCRIPT,
      [
        `pf:redeemed:${email}`,
        `pf:invitecount:${ownerEmail}`,
        `pf:bonuscredits:${ownerEmail}`,
      ],
      [code]
    );

    return NextResponse.json({
      ok: result[0] === 1,
      alreadyRedeemed: result[0] !== 1,
      inviteCount: Number(result[1]),
    });
  } catch (error) {
    console.error("Invite redeem failed", error);
    return NextResponse.json(
      { error: "Invite could not be redeemed. It will be retried automatically." },
      { status: 503 }
    );
  }
}

