import { NextResponse } from "next/server";
import { getApplications } from "@/lib/store";

export async function GET() {
  try {
    const applications = await getApplications();
    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Applications API error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
