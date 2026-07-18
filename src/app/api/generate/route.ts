import { auth } from "../../../auth";
import { NextResponse } from "next/server";
import { redisEval, redisGet } from "../../../lib/redis";

const BASE_DAILY_LIMIT = 15;
const GLOBAL_DAILY_LIMIT = Math.max(
  1,
  Number.parseInt(process.env.GEMINI_DAILY_REQUEST_LIMIT || "50", 10) || 50
);
const USAGE_TTL_SECONDS = 60 * 60 * 48;

interface BuildAction {
  type: string;
  description: string;
}

interface AiResult {
  message: string;
  actions: BuildAction[];
  suggestions: string[];
  blocked: boolean;
}

interface GenerateResponse {
  id: string;
  prompt: string;
  message: string;
  actions: BuildAction[];
  suggestions: string[];
  status: "planned" | "chat" | "blocked";
  creditsUsed: number;
  creditsLimit: number;
  creditsCharged: number;
}

const DEFAULT_SUGGESTIONS = [
  "Add a shop with rarities and a purchase UI",
  "Build a pet system with equip and follow behavior",
  "Create a PvP arena with weapon mechanics",
  "Add a leaderboard tracking player wins",
];

const SYSTEM_PROMPT = `You are Pathfinder, an AI Roblox development planner.

Classify the request as BUILD, UNCLEAR, or BLOCKED.

- BUILD: Give one short confirmation and 1-14 concrete actions scaled to complexity.
- UNCLEAR: Ask one useful clarifying question and provide up to four suggestions.
- BLOCKED: Briefly refuse unsafe or abusive requests.

Allowed action types: UI, Script, Datastore, Model.
Return only valid JSON:
{"message":"...","actions":[{"type":"UI","description":"..."}],"suggestions":[],"blocked":false}`;

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function userUsageKey(email: string) {
  return `pf:usage:${email}:${dateStamp()}`;
}

function globalUsageKey() {
  return `pf:global-usage:${dateStamp()}`;
}

function localConversationReply(prompt: string): AiResult | null {
  const value = prompt.trim().toLowerCase();
  const clean = value.replace(/[!?.,]+$/g, "").trim();

  if (/^(hi|hello|hey|hiya|heya|yo|sup|good morning|good afternoon|good evening)$/.test(clean)) {
    return {
      message: "Hey — I'm Pathfinder. Tell me what you want to build in Roblox and I'll turn it into a structured plan.",
      actions: [],
      suggestions: DEFAULT_SUGGESTIONS,
      blocked: false,
    };
  }

  if (/^(thanks|thank you|thankyou|ty|cheers)$/.test(clean)) {
    return {
      message: "You're welcome. Send the next Roblox feature whenever you're ready.",
      actions: [],
      suggestions: [],
      blocked: false,
    };
  }

  if (/^(bye|goodbye|see you|cya|later)$/.test(clean)) {
    return {
      message: "See you next time. Your initiative will be here when you return.",
      actions: [],
      suggestions: [],
      blocked: false,
    };
  }

  if (/^(who are you|what are you|what can you do|help|help me)$/.test(clean)) {
    return {
      message: "I'm Pathfinder, an AI Roblox development planner. Describe a system, feature, or game and I'll break it into build actions.",
      actions: [],
      suggestions: DEFAULT_SUGGESTIONS,
      blocked: false,
    };
  }

  if (/^(idk|i don't know|i dont know|not sure|dunno|no idea)$/.test(clean)) {
    return {
      message: "No problem — pick an idea below or describe the kind of Roblox game you enjoy.",
      actions: [],
      suggestions: DEFAULT_SUGGESTIONS,
      blocked: false,
    };
  }

  return null;
}

async function getCreditState(email: string) {
  const [usageRaw, bonusRaw] = await Promise.all([
    redisGet(userUsageKey(email)),
    redisGet(`pf:bonuscredits:${email}`),
  ]);
  const used = Math.max(0, Number.parseInt(usageRaw || "0", 10) || 0);
  const bonusCredits = Math.max(0, Number.parseInt(bonusRaw || "0", 10) || 0);
  const resetAt = new Date();
  resetAt.setUTCHours(24, 0, 0, 0);
  return {
    used,
    limit: BASE_DAILY_LIMIT + bonusCredits,
    dailyAllowance: BASE_DAILY_LIMIT,
    dailyUsed: used,
    bonusCredits,
    remaining: Math.max(0, BASE_DAILY_LIMIT - used) + bonusCredits,
    resetAt: resetAt.toISOString(),
  };
}

const RESERVE_SCRIPT = `
local userUsed = tonumber(redis.call('GET', KEYS[1]) or '0')
local bonus = tonumber(redis.call('GET', KEYS[2]) or '0')
local globalUsed = tonumber(redis.call('GET', KEYS[3]) or '0')
local dailyLimit = tonumber(ARGV[1])
local globalLimit = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])

if globalUsed >= globalLimit then
  return {-2, userUsed, bonus, globalUsed, 0}
end

local source = 0
if userUsed < dailyLimit then
  userUsed = redis.call('INCR', KEYS[1])
  redis.call('EXPIRE', KEYS[1], ttl)
  source = 1
elseif bonus > 0 then
  bonus = redis.call('DECR', KEYS[2])
  source = 2
else
  return {-1, userUsed, bonus, globalUsed, 0}
end

globalUsed = redis.call('INCR', KEYS[3])
redis.call('EXPIRE', KEYS[3], ttl)
return {1, userUsed, bonus, globalUsed, source}
`;

const REFUND_SCRIPT = `
local userUsed = tonumber(redis.call('GET', KEYS[1]) or '0')
local globalUsed = tonumber(redis.call('GET', KEYS[3]) or '0')
local source = tonumber(ARGV[1])
if source == 1 and userUsed > 0 then redis.call('DECR', KEYS[1]) end
if source == 2 then redis.call('INCR', KEYS[2]) end
if globalUsed > 0 then redis.call('DECR', KEYS[3]) end
return 1
`;

async function reserveGeminiRequest(email: string) {
  const result = await redisEval<number[]>(
    RESERVE_SCRIPT,
    [userUsageKey(email), `pf:bonuscredits:${email}`, globalUsageKey()],
    [BASE_DAILY_LIMIT, GLOBAL_DAILY_LIMIT, USAGE_TTL_SECONDS]
  );
  return {
    code: Number(result[0]),
    userUsed: Number(result[1]),
    bonusCredits: Number(result[2]),
    source: Number(result[4]),
  };
}

async function refundGeminiRequest(email: string, source: number) {
  await redisEval<number>(
    REFUND_SCRIPT,
    [userUsageKey(email), `pf:bonuscredits:${email}`, globalUsageKey()],
    [source]
  );
}

function fallbackReply(prompt: string): AiResult {
  const lower = prompt.toLowerCase();
  const actions: BuildAction[] = [];

  if (lower.includes("shop") || lower.includes("store")) {
    actions.push({ type: "UI", description: "Shop interface with item listings and purchase feedback" });
    actions.push({ type: "Script", description: "Server-validated purchasing and currency handling" });
  }
  if (lower.includes("pet")) {
    actions.push({ type: "Datastore", description: "Persistent pet inventory and equipped-pet data" });
    actions.push({ type: "Model", description: "Pet equip, follow, and unequip behaviour" });
  }
  if (lower.includes("npc")) {
    actions.push({ type: "Script", description: "NPC interaction and dialogue controller" });
  }
  if (lower.includes("leaderboard")) {
    actions.push({ type: "UI", description: "Leaderboard interface sorted by player statistics" });
    actions.push({ type: "Datastore", description: "Ordered datastore for persistent rankings" });
  }

  return actions.length > 0
    ? { message: "I created a basic fallback plan while the AI service is unavailable.", actions, suggestions: [], blocked: false }
    : { message: "The AI service is temporarily unavailable, so I couldn't safely plan that request. No credit was used.", actions: [], suggestions: DEFAULT_SUGGESTIONS, blocked: false };
}

async function generateWithGemini(prompt: string): Promise<AiResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 1800,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") return null;

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (typeof parsed.message !== "string" || !Array.isArray(parsed.actions)) return null;

    const actions = parsed.actions
      .filter(
        (action: unknown): action is BuildAction =>
          typeof action === "object" &&
          action !== null &&
          "type" in action &&
          "description" in action &&
          typeof action.type === "string" &&
          typeof action.description === "string"
      )
      .slice(0, 14)
      .map((action: BuildAction) => ({
        type: action.type.slice(0, 30),
        description: action.description.slice(0, 240),
      }));

    return {
      message: parsed.message.slice(0, 600),
      actions,
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((item: unknown): item is string => typeof item === "string").slice(0, 4)
        : [],
      blocked: parsed.blocked === true,
    };
  } catch (error) {
    console.error("Gemini request failed", error);
    return null;
  }
}

function makeResponse(
  prompt: string,
  result: AiResult,
  used: number,
  limit: number,
  creditsCharged: number
): GenerateResponse {
  return {
    id: `bld_${Date.now()}`,
    prompt,
    message: result.message,
    actions: result.actions,
    suggestions: result.suggestions,
    status: result.blocked ? "blocked" : result.actions.length > 0 ? "planned" : "chat",
    creditsUsed: used,
    creditsLimit: limit,
    creditsCharged,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await getCreditState(session.user.email.toLowerCase());
    return NextResponse.json(state);
  } catch (error) {
    console.error("Credit state failed", error);
    return NextResponse.json({ error: "Usage service unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (prompt.length > 2000) {
    return NextResponse.json({ error: "Prompt must be 2,000 characters or less" }, { status: 400 });
  }

  const email = session.user.email.toLowerCase();

  try {
    const { used, limit } = await getCreditState(email);
    const localResult = localConversationReply(prompt);
    if (localResult) {
      return NextResponse.json(makeResponse(prompt, localResult, used, limit, 0));
    }

    const reservation = await reserveGeminiRequest(email);
    if (reservation.code === -1) {
      return NextResponse.json(
        { error: "OUT_OF_CREDITS", creditsUsed: used, creditsLimit: limit },
        { status: 429 }
      );
    }
    if (reservation.code === -2) {
      return NextResponse.json(
        { error: "Pathfinder has reached today's shared Alpha AI limit. Try again after the daily reset." },
        { status: 503 }
      );
    }

    const result = await generateWithGemini(prompt);
    if (!result) {
      await refundGeminiRequest(email, reservation.source);
      return NextResponse.json(makeResponse(prompt, fallbackReply(prompt), used, limit, 0));
    }

    return NextResponse.json(
      makeResponse(
        prompt,
        result,
        reservation.userUsed,
        BASE_DAILY_LIMIT + reservation.bonusCredits,
        1
      )
    );
  } catch (error) {
    console.error("Generate route failed", error);
    return NextResponse.json({ error: "Pathfinder is temporarily unavailable. No credit was used." }, { status: 503 });
  }
}
