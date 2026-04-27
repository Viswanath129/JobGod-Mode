// GET /api/preferences — Get user preferences
// PUT /api/preferences — Update preferences
import { NextRequest, NextResponse } from "next/server";
import { getPreferences, updatePreferences } from "@/lib/store";

export async function GET() {
  try {
    return NextResponse.json(getPreferences());
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updatePreferences(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
