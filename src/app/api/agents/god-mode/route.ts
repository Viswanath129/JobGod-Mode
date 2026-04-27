import { NextRequest, NextResponse } from "next/server";
import { getPreferences, getUser, addLog, getJobs, addJobs, addScore } from "@/lib/store";
import { searchAllSources } from "@/agents/search/google-jobs";
import { scoreJob } from "@/lib/ai";
import { AutoApplyAgent } from "@/agents/auto-apply";

export async function POST(req: NextRequest) {
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
    
    let appliedCount = 0;
    for (const job of unscored) {
      // Score
      const score = await scoreJob(job, user.resumeMd);
      await addScore(score);

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

  } catch (error: any) {
    console.error("God Mode error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
