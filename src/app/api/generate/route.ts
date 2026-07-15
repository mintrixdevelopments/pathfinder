import { auth } from "../../../auth";
import { NextResponse } from "next/server";
import { redisGet, redisIncr } from "../../../lib/redis";

const BASE_DAILY_LIMIT = 15;

interface BuildAction {
  type: string;
  description: string;
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
}

const DEFAULT_SUGGESTIONS = [
  "Add a shop with rarities and a purchase UI",
  "Build a pet system with equip and follow behavior",
  "Create a PvP arena with weapon mechanics",
  "Add a leaderboard tracking player wins",
];

function todayKey(email: string) {
  return `pf:usage:${email}:${new Date().toISOString().slice(0, 10)}`;
}

async function getCreditState(email: string) {
  const [usageRaw, bonusRaw] = await Promise.all([
    redisGet(todayKey(email)),
    redisGet(`pf:bonuscredits:${email}`),
  ]);
  const used = usageRaw ? parseInt(usageRaw, 10) : 0;
  const bonus = bonusRaw ? parseInt(bonusRaw, 10) : 0;
  return { used, limit: BASE_DAILY_LIMIT + bonus };
}

function fallbackReply(prompt: string): { message: string; actions: BuildAction[]; suggestions: string[]; blocked: boolean } {
  const lower = prompt.toLowerCase().trim();
  const isGreeting = /^(hi|hey|hello|yo|sup|what's up|whats up)\b/.test(lower);
  const isUnsure = /^(idk|i don't know|i dont know|not sure|dunno|anything|something|whatever|no idea)\b/.test(lower);

  if (isGreeting) {
    return { message: "Hey, I'm Pathfinder. Tell me what to build and I'll break it down.", actions: [], suggestions: DEFAULT_SUGGESTIONS, blocked: false };
  }
  if (isUnsure || lower.length < 3) {
    return { message: "No worries — here are a few ideas, or describe your own:", actions: [], suggestions: DEFAULT_SUGGESTIONS, blocked: false };
  }

  const actions: BuildAction[] = [];
  if (lower.includes("shop") || lower.includes("store")) {
    actions.push({ type: "UI", description: "Shop interface with item listings" });
    actions.push({ type: "Script", description: "Purchase and currency deduction logic" });
  }
  if (lower.includes("pet")) {
    actions.push({ type: "Datastore", description: "Pet inventory datastore schema" });
    actions.push({ type: "Model", description: "Pet equip and follow behavior" });
  }
  if (lower.includes("npc")) {
    actions.push({ type: "Script", description: "NPC with dialogue or interaction trigger" });
  }
  if (lower.includes("leaderboard")) {
    actions.push({ type: "UI", description: "Leaderboard UI sorted by stat" });
    actions.push({ type: "Datastore", description: "Ordered datastore for ranking" });
  }
  if (actions.length === 0) {
    return { message: "I'm not sure what to build from that yet — try one of these:", actions: [], suggestions: DEFAULT_SUGGESTIONS, blocked: false };
  }
  return { message: "On it. Breaking this into pieces:", actions, suggestions: [], blocked: false };
}

async function generateWithGemini(
  prompt: string
): Promise<{ message: string; actions: BuildAction[]; suggestions: string[]; blocked: boolean } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are Pathfinder, an AI Roblox developer, talking directly to a developer in a chat interface.

Classify the message into exactly one category:

1. GREETING/SMALL TALK — reply warmly and briefly in first person, invite them to describe a build. actions: [], suggestions: 3-4 concrete build ideas, blocked: false.

2. UNCLEAR/UNDECIDED — acknowledge briefly, offer 3-4 concrete build ideas as suggestions. actions: [], blocked: false.

3. ACTUAL BUILD REQUEST — reply with ONE short first-person sentence confirming what you're doing (never say "here's the plan" verbatim). Break the work into concrete build actions. SCALE COUNT TO COMPLEXITY: trivial = 1-3 actions, moderate = 3-6 actions, a full game or complex system = 8-14 actions. suggestions: [], blocked: false.

4. OFFENSIVE OR POLICY-VIOLATING — reply with a brief, firm, first-person refusal (1-2 sentences). actions: [], suggestions: [], blocked: true.

Respond ONLY with valid JSON, no markdown:
{"message": "short first-person reply", "actions": [{"type": "UI" | "Script" | "Datastore" | "Model", "description": "specific description"}], "suggestions": ["idea"], "blocked": false}

User message: ${prompt}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] }),
      }
    );
    if (!res.ok) {
      console.error("Gemini API error:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.message !== "string" || !Array.isArray(parsed.actions)) return null;
    return {
      message: parsed.message,
      actions: parsed.actions.filter((a: unknown): a is BuildAction => typeof a === "object" && a !== null && "type" in a && "description" in a),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 4) : [],
      blocked: parsed.blocked === true,
    };
  } catch (err) {
    console.error("Gemini request failed:", err);
    return null;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const state = await getCreditState(session.user.email);
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = session.user.email;

  const body = await request.json().catch(() => null);
  const prompt = body?.prompt;
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const { used, limit } = await getCreditState(email);
  if (used >= limit) {
    return NextResponse.json({ error: "OUT_OF_CREDITS", creditsUsed: used, creditsLimit: limit }, { status: 429 });
  }

  let result = await generateWithGemini(prompt.trim());
  if (!result) {
    result = fallbackReply(prompt.trim());
  }

  const newUsed = await redisIncr(todayKey(email));

  const status: "planned" | "chat" | "blocked" = result.blocked ? "blocked" : result.actions.length > 0 ? "planned" : "chat";

  const response: GenerateResponse = {
    id: `bld_${Date.now()}`,
    prompt: prompt.trim(),
    message: result.message,
    actions: result.actions,
    suggestions: result.suggestions,
    status,
    creditsUsed: newUsed,
    creditsLimit: limit,
  };

  return NextResponse.json(response);
}
