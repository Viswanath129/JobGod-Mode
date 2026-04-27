// ============================================
// JobGod Mode — AI Abstraction Layer
// ============================================

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed: number;
}

async function callOpenAI(messages: AIMessage[], model = "gpt-4o"): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

async function callClaude(messages: AIMessage[], model = "claude-sonnet-4-20250514"): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const systemMsg = messages.find((m) => m.role === "system")?.content || "";
  const userMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemMsg,
      messages: userMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    content: data.content[0].text,
    model: data.model,
    tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0,
  };
}

/**
 * Unified AI call — tries Claude first, falls back to OpenAI
 */
export async function aiChat(messages: AIMessage[]): Promise<AIResponse> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await callClaude(messages);
    } catch (e) {
      console.warn("Claude failed, trying OpenAI fallback:", e);
    }
  }
  if (process.env.OPENAI_API_KEY) {
    return await callOpenAI(messages);
  }
  throw new Error("No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.");
}

/**
 * Quick AI helper — single prompt, single response
 */
export async function aiPrompt(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await aiChat([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);
  return response.content;
}

/**
 * AI JSON response — parses structured output
 */
export async function aiJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const response = await aiPrompt(
    systemPrompt + "\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code fences, just raw JSON.",
    userPrompt
  );

  // Strip any markdown code fences if present
  const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}
