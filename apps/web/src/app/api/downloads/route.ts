import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DEFAULT_FILE = "雅本化学DeepResearch-Feature.pdf";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".txt": "text/plain",
};

function isValidFileName(fileName: string): boolean {
  return /^[a-zA-Z0-9\u4e00-\u9fa5\s._-]+$/.test(fileName);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file");

  const targetFile = fileName || DEFAULT_FILE;

  if (fileName && !isValidFileName(fileName)) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public/downloads", targetFile);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const ext = path.extname(targetFile).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

  try {
    const fileBuffer = await fs.promises.readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(targetFile)}"`,
      },
    });
  } catch (error) {
    console.error("File read error:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}