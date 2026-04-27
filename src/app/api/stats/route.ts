// GET /api/stats — Dashboard statistics
import { NextResponse } from "next/server";
import { getStats } from "@/lib/store";

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
