import { NextRequest, NextResponse } from "next/server";
import { getJob, getUser, addApplication, updateJob } from "@/lib/store";
import { AutoApplyAgent } from "@/agents/auto-apply";

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const user = await getUser();
    if (!user.resumeMd) {
      return NextResponse.json({ error: "Please upload a resume first" }, { status: 400 });
    }
    if (!job.url || (!job.url.startsWith("http://") && !job.url.startsWith("https://"))) {
      return NextResponse.json(
        { error: "This job does not have a valid application URL yet." },
        { status: 400 }
      );
    }

    // Initialize the Auto-Apply Agent
    const agent = new AutoApplyAgent(job, user);
    
    // Run the agent (Async, don't await the whole thing if it takes too long, but for now we'll await)
    const success = await agent.run();

    if (success) {
      const appliedAt = new Date().toISOString();
      await updateJob(jobId, { status: "applied" });
      const application = await addApplication({
        id: crypto.randomUUID(),
        jobId,
        resumeId: "base-resume",
        status: "submitted",
        appliedAt,
        method: "auto",
        notes: "Submitted by auto-apply workflow.",
      });

      return NextResponse.json({
        success: true,
        message: "Application submitted successfully!",
        application,
      });
    } else {
      return NextResponse.json({ error: "Application failed. Check logs for details." }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error("Apply error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during application. Please check server logs." }, { status: 500 });
  }
}
