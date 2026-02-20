import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const filePath = path.join(UPLOAD_DIR, ...segments)

  // Security: prevent path traversal
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  if (!existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 })
  }

  const buffer = await readFile(filePath)
  const ext = path.extname(filePath).toLowerCase()

  const mimeMap: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".pptx":
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".zip": "application/zip",
  }

  const contentType = mimeMap[ext] ?? "application/octet-stream"

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  })
}
