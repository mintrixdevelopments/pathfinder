import { redisEval } from "./redis";

const RATE_LIMIT_SCRIPT = `
local value = redis.call('INCR', KEYS[1])
if value == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return {value, redis.call('TTL', KEYS[1])}
`;

export async function checkRateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const [count, ttl] = await redisEval<number[]>(
    RATE_LIMIT_SCRIPT,
    [`pf:rate:${bucket}`],
    [windowSeconds]
  );

  return {
    allowed: Number(count) <= limit,
    remaining: Math.max(0, limit - Number(count)),
    retryAfter: Math.max(1, Number(ttl)),
  };
}

export function requestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
