import { auth } from "../../../auth";
import { NextResponse } from "next/server";

interface BuildAction {
  type: string;
  description: string;
}

interface GenerateResponse {
  id: string;
  prompt: string;
  actions: BuildAction[];
  status: "planned";
  summary: string;
}

function fallbackPlan(prompt: string): BuildAction[] {
  const lower = prompt.toLowerCase();
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
  if (lower.includes("datastore") || lower.includes("save")) {
    actions.push({ type: "Datastore", description: "Add player data save/load module" });
  }
  if (actions.length === 0) {
    actions.push({ type: "Script", description: "Analyze prompt and scaffold base script structure" });
  }
  return actions;
}

function buildSummary(actions: BuildAction[]): string {
  const types = Array.from(new Set(actions.map((a) => a.type)));
  const stepWord = actions.length === 1 ? "step" : "steps";
  return `${actions.length} ${stepWord} across ${types.join(", ")}`;
}

async function generateWithGemini(prompt: string): Promise<BuildAction[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are Pathfinder, an AI Roblox developer. Given a user's build request, break it into a short list of concrete build actions. Respond ONLY with valid JSON, no markdown, no explanation, in this exact shape:
{"actions": [{"type": "UI" | "Script" | "Datastore" | "Model", "description": "short concrete description"}]}
Keep it to 2-5 actions. Be specific to Roblox development (scripts, UI, datastores, NPCs, models).

User request: ${prompt}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
        }),
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
    if (!Array.isArray(parsed.actions)) return null;

    return parsed.actions.filter(
      (a: unknown): a is BuildAction =>
        typeof a === "object" && a !== null && "type" in a && "description" in a
    );
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

  let actions = await generateWithGemini(prompt.trim());
  if (!actions || actions.length === 0) {
    actions = fallbackPlan(prompt.trim());
  }

  const response: GenerateResponse = {
    id: `bld_${Date.now()}`,
    prompt: prompt.trim(),
    actions,
    status: "planned",
    summary: buildSummary(actions),
  };

  return NextResponse.json(response);
}
