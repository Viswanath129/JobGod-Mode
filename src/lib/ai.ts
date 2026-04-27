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

import { GoogleGenerativeAI } from "@google/generative-ai";

async function callGemini(messages: AIMessage[], model = "gemini-2.0-flash"): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  const systemMsg = messages.find((m) => m.role === "system")?.content || "";
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const result = await geminiModel.generateContent({
    contents: chatMessages,
    systemInstruction: systemMsg,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  });

  const response = await result.response;
  return {
    content: response.text(),
    model: model,
    tokensUsed: 0, // Gemini SDK doesn't expose this easily in this call
  };
}

/**
 * Unified AI call — tries OpenAI (GPT-4o) first, then Gemini, then Claude
 */
export async function aiChat(messages: AIMessage[]): Promise<AIResponse> {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await callOpenAI(messages);
    } catch (e) {
      console.warn("OpenAI failed, trying fallback:", e);
    }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGemini(messages);
    } catch (e) {
      console.warn("Gemini failed, trying fallback:", e);
    }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await callClaude(messages);
    } catch (e) {
      console.warn("Claude failed, trying fallback:", e);
    }
  }
  throw new Error("No AI provider configured. Set OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY.");
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
  try {
    const response = await aiPrompt(
      systemPrompt + "\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code fences, just raw JSON.",
      userPrompt
    );

    // Strip any markdown code fences if present
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    if (!cleaned || cleaned === '') {
      throw new Error("AI returned empty response");
    }
    
    try {
      return JSON.parse(cleaned) as T;
    } catch (error) {
      console.error("Failed to parse AI JSON response:", cleaned);
      throw new Error(`AI returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    console.error("AI JSON call failed:", error);
    throw error;
  }
}

import { Job, JobScore, UserProfile, TailoredResume } from "@/types";

/**
 * AI Scoring Engine — Ranks a job against the user profile
 */
export async function scoreJob(job: Job, resumeMd: string): Promise<JobScore> {
  const systemPrompt = `You are an elite recruitment AI. Your task is to score a job description against a user's resume.
Provide a detailed breakdown of the fit.
Scoring rules:
- 0 to 100 for each category.
- Be critical but fair.
- If skills match exactly, score high.
- If location is blocked or mismatch, score low on locationPref.

Return JSON format:
{
  "totalScore": number,
  "resumeFit": number,
  "salaryQuality": number,
  "careerGrowth": number,
  "brandValue": number,
  "skillsAlignment": number,
  "locationPref": number,
  "workLifeBalance": number,
  "hiringProbability": number,
  "reasoning": "string"
}`;

  const userPrompt = `JOB:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description}

RESUME:
${resumeMd}`;

  const score = await aiJSON<Partial<JobScore>>(systemPrompt, userPrompt);
  
  return {
    ...score,
    id: crypto.randomUUID(),
    jobId: job.id,
    totalScore: score.totalScore || 0,
    resumeFit: score.resumeFit || 0,
    salaryQuality: score.salaryQuality || 0,
    careerGrowth: score.careerGrowth || 0,
    brandValue: score.brandValue || 0,
    skillsAlignment: score.skillsAlignment || 0,
    locationPref: score.locationPref || 0,
    workLifeBalance: score.workLifeBalance || 0,
    hiringProbability: score.hiringProbability || 0,
  } as JobScore;
}

/**
 * AI Resume Tailoring — rewrites bullet points for maximum ATS impact
 */
export async function generateTailoredResume(job: Job, resumeMd: string): Promise<string> {
  const systemPrompt = `You are an ATS optimization expert. 
Rewrite the provided resume to perfectly match the job description.
RULES:
1. Maintain truthfulness — do not invent experiences.
2. Optimize keywords for ATS.
3. Enhance impact using action verbs and metrics.
4. Output in Markdown format.`;

  const userPrompt = `JOB: ${job.title} at ${job.company}
DESCRIPTION: ${job.description}

RESUME:
${resumeMd}`;

  return await aiPrompt(systemPrompt, userPrompt);
}

/**
 * AI Form Mapper — maps HTML form field labels to user profile data
 */
export async function mapFormFields(fields: string[], user: UserProfile): Promise<Record<string, string>> {
  const systemPrompt = `You are a form-filling bot. 
Given a list of form field labels/names, map them to the corresponding data from the user profile.
If a field is not found in the profile, use an empty string.

USER PROFILE:
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone}
LinkedIn: ${user.linkedin}
GitHub: ${user.github}

SPECIAL RULE: If the field is asking for a Resume or CV file upload, output the exact value: "FILE_UPLOAD_RESUME".

Return JSON mapping: { "field_identifier": "value" }`;

  const userPrompt = `FIELDS TO MAP:
${fields.join("\n")}`;

  return await aiJSON<Record<string, string>>(systemPrompt, userPrompt);
}
