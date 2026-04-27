// ============================================
// JobGod Mode — Job Scorer Agent (8-Dimension)
// ============================================

import { aiJSON } from "@/lib/ai";
import type { Job, UserPreferences } from "@/types";

interface ScoreResult {
  totalScore: number;
  resumeFit: number;
  salaryQuality: number;
  careerGrowth: number;
  brandValue: number;
  skillsAlignment: number;
  locationPref: number;
  workLifeBalance: number;
  hiringProbability: number;
  reasoning: string;
  isScam: boolean;
  isRepost: boolean;
}

const SYSTEM_PROMPT = `You are JobGod's AI Scoring Engine — the most precise job evaluation system ever built.

You score jobs on 8 dimensions, each 0-100. You are brutally honest and data-driven.

SCORING DIMENSIONS (weights):
1. resume_fit (25%) — How well does the candidate's experience match the JD requirements?
2. skills_alignment (20%) — How many required/preferred skills does the candidate have?
3. salary_quality (15%) — Is the salary competitive for this role and location?
4. career_growth (10%) — Does this role offer upward mobility and skill development?
5. brand_value (10%) — Company reputation, funding stage, market position
6. location_pref (8%) — Does the location match the candidate's preferences?
7. work_life_balance (7%) — Indicators of healthy work culture
8. hiring_probability (5%) — Likelihood of getting shortlisted given competition

SCAM DETECTION FLAGS:
- Salary too high for the role/level
- No company website or very new domain
- Vague JD with no specific requirements
- Asks for payment or personal financial info
- Posted by anonymous recruiter

REPOST DETECTION:
- Job has been open for 60+ days
- Multiple identical postings from same company

TOTAL SCORE = weighted average of all 8 dimensions

Respond in JSON format ONLY.`;

export async function scoreJob(
  job: Job,
  resumeMd: string,
  preferences: UserPreferences
): Promise<ScoreResult> {
  const userPrompt = `
CANDIDATE RESUME:
${resumeMd}

CANDIDATE PREFERENCES:
- Preferred Locations: ${preferences.preferredLocations.join(", ")}
- Min Salary: ${preferences.minSalary || "Not specified"} ${preferences.salaryCurrency}
- Work Modes: ${preferences.workModes.join(", ")}
- Industries: ${preferences.industries.join(", ")}
- Experience Level: ${preferences.experienceLevel}
- Tech Stack: ${preferences.techStack.join(", ")}

JOB LISTING:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || "Not specified"}
Work Mode: ${job.workMode || "Not specified"}
Salary: ${job.salaryMin ? `${job.salaryMin}-${job.salaryMax} ${job.salaryCurrency}` : "Not disclosed"}
Source: ${job.source}
Posted: ${job.postedAt || "Unknown"}
Description: ${job.description || "Not available"}
Requirements: ${job.requirements || "Not available"}

Score this job. Return JSON with these exact fields:
{
  "totalScore": <0-100>,
  "resumeFit": <0-100>,
  "salaryQuality": <0-100>,
  "careerGrowth": <0-100>,
  "brandValue": <0-100>,
  "skillsAlignment": <0-100>,
  "locationPref": <0-100>,
  "workLifeBalance": <0-100>,
  "hiringProbability": <0-100>,
  "reasoning": "<2-3 sentence explanation>",
  "isScam": <true/false>,
  "isRepost": <true/false>
}`;

  return aiJSON<ScoreResult>(SYSTEM_PROMPT, userPrompt);
}

/**
 * Quick score without full AI — rule-based pre-filter
 */
export function quickScore(job: Job, preferences: UserPreferences): number {
  let score = 50;

  // Location match
  if (job.location) {
    const loc = job.location.toLowerCase();
    if (preferences.preferredLocations.some((p) => loc.includes(p.toLowerCase()))) {
      score += 15;
    }
    if (preferences.blockedLocations.some((p) => loc.includes(p.toLowerCase()))) {
      score -= 30;
    }
  }

  // Work mode match
  if (job.workMode && preferences.workModes.includes(job.workMode)) {
    score += 10;
  }

  // Salary check
  if (job.salaryMin && preferences.minSalary) {
    if (job.salaryMin >= preferences.minSalary) score += 10;
    else score -= 10;
  }

  // Disliked company
  if (preferences.dislikedCompanies.some(
    (c) => job.company.toLowerCase().includes(c.toLowerCase())
  )) {
    score -= 40;
  }

  // Liked company bonus
  if (preferences.likedCompanies.some(
    (c) => job.company.toLowerCase().includes(c.toLowerCase())
  )) {
    score += 20;
  }

  return Math.max(0, Math.min(100, score));
}
