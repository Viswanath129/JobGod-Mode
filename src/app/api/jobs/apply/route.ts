import { NextRequest, NextResponse } from "next/server";
import { getJob, getUser, addLog } from "@/lib/store";
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

    // Initialize the Auto-Apply Agent
    const agent = new AutoApplyAgent(job, user);
    
    // Run the agent (Async, don't await the whole thing if it takes too long, but for now we'll await)
    const success = await agent.run();

    if (success) {
      return NextResponse.json({ success: true, message: "Application submitted successfully!" });
    } else {
      return NextResponse.json({ error: "Application failed. Check logs for details." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Apply error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
