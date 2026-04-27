// GET /api/jobs — List all jobs (with optional filters)
// POST /api/jobs — Add new jobs manually
import { NextRequest, NextResponse } from "next/server";
import { getJobs, addJobs } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobs = getJobs({
      status: searchParams.get("status") || undefined,
      source: searchParams.get("source") || undefined,
      minScore: searchParams.get("minScore")
        ? parseInt(searchParams.get("minScore")!)
        : undefined,
      search: searchParams.get("search") || undefined,
    });
    return NextResponse.json({ jobs, total: jobs.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newJobs = addJobs(Array.isArray(body) ? body : [body]);
    return NextResponse.json({ added: newJobs.length, jobs: newJobs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add jobs" }, { status: 500 });
  }
}
