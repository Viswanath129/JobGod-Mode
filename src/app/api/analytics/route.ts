import { NextResponse } from "next/server";
import { getAnalyticsSnapshot } from "@/lib/store";

export async function GET() {
  try {
    const analytics = await getAnalyticsSnapshot();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
