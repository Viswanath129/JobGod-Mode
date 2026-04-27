// ============================================
// JobGod Mode — Resume Intelligence Engine
// ============================================

import { aiPrompt, aiJSON } from "@/lib/ai";

interface RewriteResult {
  resumeMd: string;
  summaryRewritten: string;
  keywordsAdded: string[];
  atsScore: number;
  coverLetter: string;
  recruiterMsg: string;
}

const SYSTEM_PROMPT = `You are JobGod's Resume Intelligence Engine — the world's most advanced ATS optimization system.

Your job is to take a candidate's base resume and a job description, then produce:
1. A rewritten resume tailored for this specific role
2. A rewritten professional summary targeting the role
3. Keywords naturally injected (never fabricate skills the candidate doesn't have)
4. A predicted ATS score (0-100)
5. A personalized cover letter (3 paragraphs max)
6. A LinkedIn recruiter outreach message (2-3 sentences)

RULES:
- NEVER fabricate experience or skills the candidate doesn't have
- Reorder and emphasize relevant experience
- Use action verbs and quantified achievements
- Match JD terminology exactly (ATS keyword matching)
- Keep resume concise (1-2 pages worth of content)
- Cover letter must be specific to this company and role
- Recruiter message must be casual, professional, and compelling

Return your response as valid JSON with these fields:
{
  "resumeMd": "<full rewritten resume in markdown>",
  "summaryRewritten": "<new professional summary paragraph>",
  "keywordsAdded": ["keyword1", "keyword2", ...],
  "atsScore": <0-100>,
  "coverLetter": "<full cover letter>",
  "recruiterMsg": "<LinkedIn outreach message>"
}`;

export async function rewriteResume(
  baseResumeMd: string,
  jobTitle: string,
  jobCompany: string,
  jobDescription: string,
  jobRequirements: string
): Promise<RewriteResult> {
  const userPrompt = `
BASE RESUME (Markdown):
${baseResumeMd}

TARGET JOB:
Title: ${jobTitle}
Company: ${jobCompany}
Description: ${jobDescription}
Requirements: ${jobRequirements}

Rewrite the resume for maximum ATS score and relevance to this specific role.
Return valid JSON only.`;

  return aiJSON<RewriteResult>(SYSTEM_PROMPT, userPrompt);
}

/**
 * Generate interview prep materials
 */
export async function generateInterviewPrep(
  resumeMd: string,
  jobTitle: string,
  company: string,
  jobDescription: string
): Promise<{
  hrQuestions: { question: string; suggestedAnswer: string }[];
  techQuestions: { question: string; suggestedAnswer: string }[];
  companyBrief: string;
  prepRoadmap: string;
}> {
  const result = await aiJSON(
    `You are an expert interview coach. Generate comprehensive interview preparation materials.
Return JSON with: hrQuestions (array of {question, suggestedAnswer}), techQuestions (array of {question, suggestedAnswer}),
companyBrief (2-paragraph company research), prepRoadmap (step-by-step preparation plan).
Generate at least 5 HR questions and 5 technical questions.`,
    `Resume: ${resumeMd}\n\nJob: ${jobTitle} at ${company}\nJD: ${jobDescription}`
  );
  return result as {
    hrQuestions: { question: string; suggestedAnswer: string }[];
    techQuestions: { question: string; suggestedAnswer: string }[];
    companyBrief: string;
    prepRoadmap: string;
  };
}

/**
 * Generate salary negotiation email draft
 */
export async function generateNegotiationDraft(
  currentOffer: string,
  targetSalary: string,
  role: string,
  company: string
): Promise<string> {
  return aiPrompt(
    "You are an expert salary negotiation coach. Write a professional, confident negotiation email.",
    `I received an offer of ${currentOffer} for the ${role} position at ${company}. 
     My target is ${targetSalary}. Write a negotiation email that is polite but firm.`
  );
}
