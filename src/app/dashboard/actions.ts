"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { ensureMockUser } from "@/lib/ensure-mock-user"
import type { ActionResult } from "@/types"

// ── Exported shapes ────────────────────────────────────────

export interface SemesterRow {
  id: string
  name: string
  year: number
  startDate: Date
  endDate: Date
  userId: string
}

export interface UnitRow {
  id: string
  code: string
  name: string
  color: string | null
  isArchived: boolean
  calendarId: string | null
  semesterId: string
  _count: { weekTopics: number; quizzes: number }
}

// ── Semesters ─────────────────────────────────────────────

export async function getSemesters(userId: string): Promise<SemesterRow[]> {
  const rows = await prisma.semester.findMany({
    where: { userId },
    orderBy: [{ year: "desc" }, { startDate: "desc" }],
  })
  return rows as SemesterRow[]
}

export async function createSemester(data: {
  userId: string
  name: string
  year: number
  startDate: Date
  endDate: Date
}): Promise<ActionResult<{ id: string }>> {
  try {
    await ensureMockUser()
    const semester = await prisma.semester.create({ data })
    revalidatePath("/dashboard")
    return { success: true, data: { id: semester.id } }
  } catch {
    return { success: false, error: "Failed to create semester" }
  }
}

// ── Units ──────────────────────────────────────────────────

export async function getUnits(semesterId: string): Promise<UnitRow[]> {
  const rows = await prisma.unit.findMany({
    where: { semesterId },
    orderBy: { code: "asc" },
    include: {
      _count: {
        select: {
          weekTopics: true,
          quizzes: true,
        },
      },
    },
  })
  return rows as UnitRow[]
}

export async function createUnit(data: {
  code: string
  name: string
  color: string
  semesterId: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const unit = await prisma.unit.create({ data })
    revalidatePath("/dashboard")
    return { success: true, data: { id: unit.id } }
  } catch {
    return { success: false, error: "Failed to create unit" }
  }
}

export async function toggleArchiveUnit(
  id: string,
  isArchived: boolean
): Promise<ActionResult<null>> {
  try {
    await prisma.unit.update({ where: { id }, data: { isArchived } })
    revalidatePath("/dashboard")
    return { success: true, data: null }
  } catch {
    return { success: false, error: "Failed to update unit" }
  }
}

export async function deleteUnit(id: string): Promise<ActionResult<null>> {
  try {
    await prisma.unit.delete({ where: { id } })
    revalidatePath("/dashboard")
    return { success: true, data: null }
  } catch {
    return { success: false, error: "Failed to delete unit" }
  }
}
