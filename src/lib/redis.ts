const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisCommand(args: (string | number)[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) throw new Error("Redis not configured");
  const path = args.map((a) => encodeURIComponent(String(a))).join("/");
  const res = await fetch(`${REDIS_URL}/${path}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return data.result;
}

export async function redisGet(key: string): Promise<string | null> {
  const result = await redisCommand(["get", key]);
  return result === null ? null : String(result);
}
export async function redisSet(key: string, value: string) {
  return redisCommand(["set", key, value]);
}
export async function redisIncr(key: string): Promise<number> {
  const result = await redisCommand(["incr", key]);
  return Number(result);
}
export async function redisSetNX(key: string, value: string): Promise<number> {
  const result = await redisCommand(["setnx", key, value]);
  return Number(result);
}
