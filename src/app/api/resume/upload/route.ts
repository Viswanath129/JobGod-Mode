import { NextRequest, NextResponse } from "next/server";
import { updateUser } from "@/lib/store";
import { promises as fs } from "fs";
import path from "path";

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
      // Dynamic import to bypass Turbopack ESM resolution issues
      const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse");
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (file.name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
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

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    await fs.mkdir(dataDir, { recursive: true });

    // Save the file to disk
    const extension = file.name.endsWith(".pdf") ? ".pdf" : ".docx";
    const filePath = path.join(dataDir, `resume${extension}`);
    await fs.writeFile(filePath, buffer);

    // Update the base resume in the store
    await updateUser({ 
      resumeMd: text,
      originalResumePath: filePath
    });

    return NextResponse.json({
      success: true,
      message: "Resume uploaded and parsed successfully.",
      preview: text.substring(0, 500) + "...",
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process resume: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
