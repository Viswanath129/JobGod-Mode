// POST /api/jobs/score — Score a specific job
import { NextRequest, NextResponse } from "next/server";
import { getJob, getPreferences, getUser, addScore, updateJob, addLog } from "@/lib/store";
import { scoreJob, quickScore } from "@/agents/scorer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, useAI = false } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const preferences = getPreferences();
    const user = getUser();

    let result;

    if (useAI && (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)) {
      // Full AI scoring
      result = await scoreJob(job, user.resumeMd, preferences);

      // Update scam/repost flags
      updateJob(jobId, {
        isScam: result.isScam,
        isRepost: result.isRepost,
        status: "scored",
      });
    } else {
      // Quick rule-based scoring
      const quick = quickScore(job, preferences);
      result = {
        totalScore: quick,
        resumeFit: quick,
        salaryQuality: 50,
        careerGrowth: 50,
        brandValue: 50,
        skillsAlignment: quick,
        locationPref: 50,
        workLifeBalance: 50,
        hiringProbability: 50,
        reasoning: "Quick score based on preference matching (no AI)",
        isScam: false,
        isRepost: false,
      };
      updateJob(jobId, { status: "scored" });
    }

    const score = addScore({
      id: crypto.randomUUID(),
      jobId,
      totalScore: result.totalScore,
      resumeFit: result.resumeFit,
      salaryQuality: result.salaryQuality,
      careerGrowth: result.careerGrowth,
      brandValue: result.brandValue,
      skillsAlignment: result.skillsAlignment,
      locationPref: result.locationPref,
      workLifeBalance: result.workLifeBalance,
      hiringProbability: result.hiringProbability,
      reasoning: result.reasoning,
    });

    addLog({
      id: crypto.randomUUID(),
      agentType: "scorer",
      action: `Scored "${job.title}" at ${job.company}: ${result.totalScore}/100`,
      details: { jobId, score: result.totalScore, useAI },
      status: "success",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ score });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
