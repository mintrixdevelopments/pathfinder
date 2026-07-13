import { auth } from "../../../auth";
import { NextResponse } from "next/server";

interface BuildAction {
  type: string;
  description: string;
}

interface GenerateResponse {
  id: string;
  prompt: string;
  message: string;
  actions: BuildAction[];
  status: "planned" | "chat";
}

function fallbackReply(prompt: string): { message: string; actions: BuildAction[] } {
  const lower = prompt.toLowerCase();
  const isGreeting = /^(hi|hey|hello|yo|sup|what's up)\b/.test(lower.trim());

  if (isGreeting) {
    return {
      message: "Hey! I'm Pathfinder. Tell me what you want to build in your Roblox game — a shop, pets, a leaderboard, whatever — and I'll plan it out.",
      actions: [],
    };
  }

  const actions: BuildAction[] = [];
  if (lower.includes("shop") || lower.includes("store")) {
    actions.push({ type: "UI", description: "Create shop interface with item listings" });
    actions.push({ type: "Script", description: "Add purchase and currency deduction logic" });
  }
  if (lower.includes("pet")) {
    actions.push({ type: "Datastore", description: "Create pet inventory datastore schema" });
    actions.push({ type: "Model", description: "Set up pet equip and follow behavior" });
  }
  if (lower.includes("npc")) {
    actions.push({ type: "Script", description: "Add NPC with dialogue or interaction trigger" });
  }
  if (lower.includes("leaderboard")) {
    actions.push({ type: "UI", description: "Create leaderboard UI sorted by stat" });
    actions.push({ type: "Datastore", description: "Add ordered datastore for leaderboard ranking" });
  }
  if (actions.length === 0) {
    return {
      message: "I'm not sure what to build from that yet — try describing a specific feature, like \"add a shop\" or \"create a pet system.\"",
      actions: [],
    };
  }

  const types = Array.from(new Set(actions.map((a) => a.type)));
  return { message: `Got it — here's the plan (${types.join(", ")}):`, actions };
}

async function generateWithGemini(
  prompt: string
): Promise<{ message: string; actions: BuildAction[] } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are Pathfinder, an AI Roblox developer built into a chat interface. A user is talking to you.

Decide what kind of message this is:
- If it is a greeting, small talk, or a question about what you can do: reply conversationally and warmly, introduce yourself briefly if it is a first greeting, and invite them to describe a build. Return an empty actions array.
- If it is an actual request to build or change something in their Roblox game: write a short, natural one-sentence reply confirming what you are about to do, and break the work into concrete build actions. SCALE THE NUMBER OF ACTIONS TO THE COMPLEXITY OF THE REQUEST. A simple request ("add a spawn point") might be 1-2 actions. A moderate request ("add a shop") might be 3-5 actions. A large, complex request ("build a highly realistic PVP shooter with advanced graphics") should be 6-12 actions, covering distinct systems: weapon mechanics, movement, environment/graphics, UI/HUD, matchmaking or spawning, sound, and any other systems a real developer would actually need to build. Do not compress a complex request into a handful of vague, high-level bullets — break it into the same granular steps a senior Roblox developer would actually implement one by one.

Respond ONLY with valid JSON, no markdown, in this exact shape:
{"message": "your natural conversational reply, 1-2 sentences", "actions": [{"type": "UI" | "Script" | "Datastore" | "Model", "description": "short concrete description"}]}

If there's nothing to build, actions must be an empty array [].

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
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
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
      actions: parsed.actions.filter(
        (a: unknown): a is BuildAction =>
          typeof a === "object" && a !== null && "type" in a && "description" in a
      ),
    };
  } catch (err) {
    console.error("Gemini request failed:", err);
    return null;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const prompt = body?.prompt;

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  let result = await generateWithGemini(prompt.trim());
  if (!result) {
    result = fallbackReply(prompt.trim());
  }

  const response: GenerateResponse = {
    id: `bld_${Date.now()}`,
    prompt: prompt.trim(),
    message: result.message,
    actions: result.actions,
    status: result.actions.length > 0 ? "planned" : "chat",
  };

  return NextResponse.json(response);
}
