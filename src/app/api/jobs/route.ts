// GET /api/jobs — List all jobs (with optional filters)
// POST /api/jobs — Add new jobs manually
import { NextRequest, NextResponse } from "next/server";
import { getJobs, addJobs, deleteJob } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobs = await getJobs({
      status: searchParams.get("status") || undefined,
      source: searchParams.get("source") || undefined,
      minScore: searchParams.get("minScore")
        ? parseInt(searchParams.get("minScore")!)
        : undefined,
      search: searchParams.get("search") || undefined,
    });
    return NextResponse.json({ jobs, total: jobs.length });
  } catch {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newJobs = await addJobs(Array.isArray(body) ? body : [body]);
    return NextResponse.json({ added: newJobs.length, jobs: newJobs });
  } catch {
    return NextResponse.json({ error: "Failed to add jobs" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }
    const success = await deleteJob(id);
    if (success) {
      return NextResponse.json({ success: true, message: "Job deleted successfully" });
    } else {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
