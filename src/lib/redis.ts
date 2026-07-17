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

export async function redisSet(key: string, value: string): Promise<void> {
  await redisCommand(["SET", key, value]);
}

export async function redisSetNX(key: string, value: string): Promise<number> {
  const result = await redisCommand(["SETNX", key, value]);
  return Number(result);
}

export async function redisIncr(key: string): Promise<number> {
  const result = await redisCommand(["INCR", key]);
  return Number(result);
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

