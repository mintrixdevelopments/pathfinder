const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisCommand(args: (string | number)[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error("Redis is not configured");
  }

  const response = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.error) {
    const detail = data?.error || `HTTP ${response.status}`;
    throw new Error(`Redis command failed: ${detail}`);
  }

  return data.result;
}

export async function redisGet(key: string): Promise<string | null> {
  const result = await redisCommand(["GET", key]);
  return result === null ? null : String(result);
}

export async function redisGetDelete(key: string): Promise<string | null> {
  const result = await redisCommand(["GETDEL", key]);
  return result === null ? null : String(result);
}

export async function redisSet(key: string, value: string): Promise<void> {
  await redisCommand(["SET", key, value]);
}

export async function redisSetEx(
  key: string,
  seconds: number,
  value: string
): Promise<void> {
  await redisCommand(["SET", key, value, "EX", seconds]);
}

export async function redisDelete(...keys: string[]): Promise<number> {
  if (keys.length === 0) return 0;
  return Number(await redisCommand(["DEL", ...keys]));
}

export async function redisExpire(key: string, seconds: number): Promise<boolean> {
  return Number(await redisCommand(["EXPIRE", key, seconds])) === 1;
}

export async function redisTtl(key: string): Promise<number> {
  return Number(await redisCommand(["TTL", key]));
}

export async function redisSetNX(key: string, value: string): Promise<number> {
  const result = await redisCommand(["SETNX", key, value]);
  return Number(result);
}

export async function redisIncr(key: string): Promise<number> {
  const result = await redisCommand(["INCR", key]);
  return Number(result);
}

export async function redisLPush(key: string, value: string): Promise<number> {
  return Number(await redisCommand(["LPUSH", key, value]));
}

export async function redisLRange(key: string, start: number, stop: number): Promise<string[]> {
  const result = await redisCommand(["LRANGE", key, start, stop]);
  return Array.isArray(result) ? result.map(String) : [];
}

export async function redisLTrim(key: string, start: number, stop: number): Promise<void> {
  await redisCommand(["LTRIM", key, start, stop]);
}

export async function redisEval<T>(
  script: string,
  keys: string[],
  args: (string | number)[] = []
): Promise<T> {
  return (await redisCommand([
    "EVAL",
    script,
    keys.length,
    ...keys,
    ...args,
  ])) as T;
}
