import { NextResponse } from "next/server";
import { getPreferences, getUser, addLog, getJobs, addJobs, addScore, updateJob } from "@/lib/store";
import { searchAllSources } from "@/agents/search/google-jobs";
import { scoreJob } from "@/agents/scorer";
import { AutoApplyAgent } from "@/agents/auto-apply";

export async function POST() {
  try {
    const user = await getUser();
    const preferences = await getPreferences();

    if (!user.resumeMd) {
      return NextResponse.json({ error: "Please upload a resume first" }, { status: 400 });
    }

    await addLog({
      id: crypto.randomUUID(),
      agentType: "system",
      action: "God Mode activated: Full autopilot engaged",
      details: {},
      status: "success",
      createdAt: new Date().toISOString(),
    });

    // 1. Search for jobs
    const query = "AI Engineer"; // Could be dynamic from preferences
    const locations = preferences.preferredLocations;
    const rawJobs = await searchAllSources(query, locations);
    const newJobs = await addJobs(rawJobs);

    await addLog({
      id: crypto.randomUUID(),
      agentType: "search",
      action: `Found ${rawJobs.length} jobs, added ${newJobs.length} new`,
      details: { found: rawJobs.length, added: newJobs.length },
      status: "success",
      createdAt: new Date().toISOString(),
    });

    // 2. Score and Apply
    const allJobs = await getJobs();
    const unscored = allJobs.filter(j => !j.score && j.status === "discovered");
    
    // Limit to 3 jobs per run to prevent serverless function timeout
    const jobsToProcess = unscored.slice(0, 3);
    
    let appliedCount = 0;
    for (const job of jobsToProcess) {
      // Score using the advanced 8-dimension scorer
      const scoreResult = await scoreJob(job, user.resumeMd, preferences);
      const score = {
        id: crypto.randomUUID(),
        jobId: job.id,
        ...scoreResult
      };
      await addScore(score);

      // We should also update the job status and flags in the store
      await updateJob(job.id, {
        isScam: scoreResult.isScam,
        isRepost: scoreResult.isRepost,
        status: "scored",
      });

      // Apply if threshold met
      if (score.totalScore >= (preferences.autoApplyThreshold || 80)) {
        const agent = new AutoApplyAgent(job, user);
        const success = await agent.run();
        if (success) appliedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `God Mode finished. Discovered ${newJobs.length} new jobs, applied to ${appliedCount}.` 
    });

  } catch (error: unknown) {
    console.error("God Mode error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during God Mode execution. Please check server logs." }, { status: 500 });
  }
}
