import { NextRequest, NextResponse } from "next/server";
import { updateUser } from "@/lib/store";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (file.name.endsWith(".pdf")) {
      const data = await pdf(buffer);
      text = data.text;
    } else if (file.name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload PDF or DOCX." },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from the file." },
        { status: 400 }
      );
    }

    // Update the base resume in the store
    updateUser({ resumeMd: text });

    return NextResponse.json({
      success: true,
      message: "Resume uploaded and parsed successfully.",
      preview: text.substring(0, 500) + "...",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process resume: " + error.message },
      { status: 500 }
    );
  }
}
