/**
 * Calls Anthropic, OpenAI, or Gemini based on AI_PROVIDER and API keys in env.
 * Expects the model to return JSON: assistantMessage, summary, solution, code, recommendations.
 */

const STRUCTURE_HINT = `Respond with a single JSON object only (no markdown fences), using this exact shape:
{"assistantMessage":"short friendly reply for chat","summary":"...","solution":"...","code":"...","recommendations":"..."}
Use plain strings. In "code", put runnable code or clear snippets when relevant; otherwise a concise placeholder.`;

function parseJsonFromModelText(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty model response");
  }
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function normalizeStructured(parsed) {
  return {
    assistantMessage: String(parsed.assistantMessage ?? "").trim() || "Here is the result.",
    summary: String(parsed.summary ?? ""),
    solution: String(parsed.solution ?? ""),
    code: String(parsed.code ?? ""),
    recommendations: String(parsed.recommendations ?? ""),
  };
}

export function getResolvedAiProvider() {
  return String(process.env.AI_PROVIDER || "anthropic").trim().toLowerCase();
}

function mockStructuredFromPrompt(prompt) {
  const trimmed = String(prompt || "").trim();
  const title = trimmed.length > 72 ? `${trimmed.slice(0, 72)}…` : trimmed || "your request";
  return {
    assistantMessage: "Done — see the output panel.",
    summary: `Goal: ${title}\n\nThis is a free local demo response (AI_PROVIDER=mock).`,
    solution: [
      "This provider is meant for testing the frontend UX for free.",
      "",
      "Next steps:",
      "1) Add a real provider key later (OpenAI / Anthropic / Gemini).",
      "2) Keep the same UI — only switch AI_PROVIDER in Backend/.env.",
      "3) When ready, add Stripe/subscriptions for real billing (optional).",
    ].join("\n"),
    code: [
      "// Demo snippet (not from a real model)",
      "export function hello() {",
      "  return 'WELP mock provider is working';",
      "}",
    ].join("\n"),
    recommendations: [
      "- Try multiple prompts to verify chat history is sent.",
      "- Check copy/download actions.",
      "- Confirm demo-expired overlay works by shortening DEMO_DURATION_MS.",
    ].join("\n"),
  };
}

async function callAnthropic(systemPrompt, userMessages) {
  const key = String(process.env.ANTHROPIC_API_KEY || "").trim();
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");

  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";

  const messages = userMessages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system: `${systemPrompt}\n\n${STRUCTURE_HINT}`,
      messages,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || `Anthropic error (${res.status})`);
  }

  const text = data.content?.[0]?.text;
  return parseJsonFromModelText(text);
}

async function callOpenAI(systemPrompt, userMessages) {
  const key = String(process.env.OPENAI_API_KEY || "").trim();
  if (!key) throw new Error("OPENAI_API_KEY is not set");

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const messages = [
    { role: "system", content: `${systemPrompt}\n\n${STRUCTURE_HINT}` },
    ...userMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data.error;
    const code = err?.code;
    const msg = err?.message || "";
    if (
      code === "insufficient_quota" ||
      code === "billing_not_active" ||
      /quota|billing|exceeded your current quota/i.test(msg)
    ) {
      throw new Error(
        "OpenAI rejected this request: no quota or billing is not set up for this API key. " +
          "In OpenAI: open Usage / Billing, add a payment method or top up credits, and confirm the key is for a project with access. " +
          "Details: https://platform.openai.com/docs/guides/error-codes/api-errors"
      );
    }
    if (code === "rate_limit_exceeded" || res.status === 429) {
      throw new Error("OpenAI rate limit — wait a moment and try again, or lower usage in your org settings.");
    }
    throw new Error(msg || `OpenAI error (${res.status})`);
  }

  const text = data.choices?.[0]?.message?.content;
  return parseJsonFromModelText(text);
}

async function callGemini(systemPrompt, userMessages) {
  const key = String(process.env.GEMINI_API_KEY || "").trim();
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const contents = [];
  for (const m of userMessages) {
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `${systemPrompt}\n\n${STRUCTURE_HINT}` }] },
      contents,
      generationConfig: {
        temperature: 0.4,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || `Gemini error (${res.status})`;
    throw new Error(msg);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return parseJsonFromModelText(text);
}

export async function runWorkspaceModel(userMessages) {
  const provider = getResolvedAiProvider();
  const systemPrompt =
    "You are an expert software and product assistant (Replit-style workspace). Be practical and concise.";

  let parsed;
  if (provider === "mock") {
    const lastUser = [...userMessages].reverse().find((m) => m.role === "user");
    parsed = mockStructuredFromPrompt(lastUser?.content);
  } else if (provider === "openai") {
    parsed = await callOpenAI(systemPrompt, userMessages);
  } else if (provider === "gemini") {
    parsed = await callGemini(systemPrompt, userMessages);
  } else {
    parsed = await callAnthropic(systemPrompt, userMessages);
  }

  return normalizeStructured(parsed);
}

export function isAiConfigured() {
  const p = getResolvedAiProvider();
  if (p === "mock") return true;
  if (p === "openai") return Boolean(String(process.env.OPENAI_API_KEY || "").trim());
  if (p === "gemini") return Boolean(String(process.env.GEMINI_API_KEY || "").trim());
  return Boolean(String(process.env.ANTHROPIC_API_KEY || "").trim());
}
