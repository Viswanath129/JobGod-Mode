// POST /api/jobs/search — Trigger a job search
import { NextRequest, NextResponse } from "next/server";
import { addJobs, getPreferences, addLog } from "@/lib/store";
import { searchAllSources } from "@/agents/search/google-jobs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query || "AI Engineer";
    const preferences = await getPreferences();
    const locations = body.locations || preferences.preferredLocations;

    await addLog({
      id: crypto.randomUUID(),
      agentType: "search",
      action: `Searching: "${query}" in ${locations.join(", ")}`,
      details: { query, locations },
      status: "success",
      createdAt: new Date().toISOString(),
    });

    const rawJobs = await searchAllSources(query, locations);
    const added = await addJobs(rawJobs);

    await addLog({
      id: crypto.randomUUID(),
      agentType: "search",
      action: `Found ${rawJobs.length} jobs, added ${added.length} new`,
      details: { found: rawJobs.length, added: added.length },
      status: "success",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      searched: query,
      locations,
      found: rawJobs.length,
      added: added.length,
      jobs: added,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during the job search. Please check server logs." }, { status: 500 });
  }
}
