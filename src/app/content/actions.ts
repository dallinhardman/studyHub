"use server"

import { revalidatePath } from "next/cache"
import { writeFile, mkdir, unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"
import { ensureMockUser } from "@/lib/ensure-mock-user"
import type { ActionResult } from "@/types"
import type { ContentType } from "@/types"

// ── Types ─────────────────────────────────────────────────

export interface ContentItem {
  id: string
  title: string
  type: ContentType
  fileUrl: string | null
  mimeType: string | null
  aiSummary: string | null
  uploadedAt: Date
  weekTopicId: string
  weekNumber: number
  weekTitle: string
  unitId: string
  unitCode: string
  unitColor: string | null
}

export interface WeekGroup {
  weekNumber: number
  weekTitle: string
  weekTopicId: string
  items: ContentItem[]
}

export interface UnitGroup {
  unitId: string
  unitCode: string
  unitName: string
  unitColor: string | null
  weeks: WeekGroup[]
}

// ── Queries ───────────────────────────────────────────────

export async function getContentByUser(userId: string): Promise<UnitGroup[]> {
  const units = await prisma.unit.findMany({
    where: {
      isArchived: false,
      semester: { userId },
    },
    orderBy: [{ semester: { year: "asc" } }, { code: "asc" }],
    include: {
      weekTopics: {
        orderBy: { weekNumber: "asc" },
        include: {
          content: {
            orderBy: { uploadedAt: "desc" },
          },
        },
      },
    },
  })

  return units
    .map((unit) => ({
      unitId: unit.id,
      unitCode: unit.code,
      unitName: unit.name,
      unitColor: unit.color,
      weeks: unit.weekTopics
        .filter((wt) => wt.content.length > 0)
        .map((wt) => ({
          weekNumber: wt.weekNumber,
          weekTitle: wt.title,
          weekTopicId: wt.id,
          items: wt.content.map((c) => ({
            id: c.id,
            title: c.title,
            type: c.type as ContentType,
            fileUrl: c.fileUrl,
            mimeType: c.mimeType,
            aiSummary: c.aiSummary,
            uploadedAt: c.uploadedAt,
            weekTopicId: wt.id,
            weekNumber: wt.weekNumber,
            weekTitle: wt.title,
            unitId: unit.id,
            unitCode: unit.code,
            unitColor: unit.color,
          })),
        })),
    }))
    .filter((u) => u.weeks.length > 0)
}

export async function getWeekTopicsForUser(
  userId: string
): Promise<{ id: string; label: string; unitCode: string }[]> {
  const rows = await prisma.weekTopic.findMany({
    where: { unit: { isArchived: false, semester: { userId } } },
    orderBy: [
      { unit: { semester: { year: "asc" } } },
      { unit: { code: "asc" } },
      { weekNumber: "asc" },
    ],
    include: { unit: { select: { code: true } } },
  })

  return rows.map((wt) => ({
    id: wt.id,
    label: `${wt.unit.code} – ${wt.title}`,
    unitCode: wt.unit.code,
  }))
}

// ── Upload ────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

export async function uploadContent(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    await ensureMockUser()

    const file = formData.get("file") as File | null
    const title = (formData.get("title") as string | null)?.trim()
    const type = (formData.get("type") as ContentType | null) ?? "OTHER"
    const weekTopicId = formData.get("weekTopicId") as string | null

    if (!file || file.size === 0) return { success: false, error: "No file provided" }
    if (!weekTopicId) return { success: false, error: "Week topic is required" }

    const finalTitle = title || file.name.replace(/\.[^.]+$/, "")

    // Write file to /uploads/<weekTopicId>/<timestamp>-<filename>
    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    const dir = path.join(UPLOAD_DIR, weekTopicId)
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const filePath = path.join(dir, safeFilename)
    await writeFile(filePath, Buffer.from(bytes))

    // Relative URL served from /api/uploads/...
    const fileUrl = `/api/uploads/${weekTopicId}/${safeFilename}`

    const record = await prisma.content.create({
      data: {
        title: finalTitle,
        type,
        fileUrl,
        mimeType: file.type || null,
        weekTopicId,
      },
    })

    revalidatePath("/content")
    return { success: true, data: { id: record.id } }
  } catch (err) {
    console.error("uploadContent error", err)
    return { success: false, error: "Upload failed" }
  }
}

export async function deleteContent(id: string): Promise<ActionResult<null>> {
  try {
    const item = await prisma.content.findUniqueOrThrow({ where: { id } })

    // Delete file from disk if local upload
    if (item.fileUrl?.startsWith("/api/uploads/")) {
      const rel = item.fileUrl.replace("/api/uploads/", "")
      const absPath = path.join(UPLOAD_DIR, rel)
      if (existsSync(absPath)) await unlink(absPath)
    }

    await prisma.content.delete({ where: { id } })
    revalidatePath("/content")
    return { success: true, data: null }
  } catch {
    return { success: false, error: "Delete failed" }
  }
}
