"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"

// ── Exported shapes ────────────────────────────────────────

export interface ConceptRow {
  id: string
  front: string
  back: string
  source: string | null
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: Date
  lastReviewedAt: Date | null
  weekTopicId: string | null
  contentId: string | null
}

export interface WeekTopicRow {
  id: string
  weekNumber: number
  title: string
  objectives: string | null
  unitId: string
  concepts: ConceptRow[]
}

export interface UnitDetailRow {
  id: string
  code: string
  name: string
  color: string | null
  isArchived: boolean
  semesterId: string
  semester: { id: string; name: string; year: number }
}

// ── Unit ──────────────────────────────────────────────────

export async function getUnit(id: string): Promise<UnitDetailRow | null> {
  const row = await prisma.unit.findUnique({
    where: { id },
    include: { semester: { select: { id: true, name: true, year: true } } },
  })
  return row as UnitDetailRow | null
}

export async function updateUnit(
  id: string,
  data: { code?: string; name?: string; color?: string }
): Promise<ActionResult<null>> {
  try {
    await prisma.unit.update({ where: { id }, data })
    revalidatePath(`/units/${id}`)
    revalidatePath("/dashboard")
    return { success: true, data: null }
  } catch {
    return { success: false, error: "Failed to update unit" }
  }
}

// ── Week Topics ───────────────────────────────────────────

export async function getWeekTopics(unitId: string): Promise<WeekTopicRow[]> {
  const rows = await prisma.weekTopic.findMany({
    where: { unitId },
    orderBy: { weekNumber: "asc" },
    include: { concepts: { orderBy: { id: "asc" } } },
  })
  return rows as WeekTopicRow[]
}

export async function createWeekTopic(data: {
  unitId: string
  weekNumber: number
  title: string
  objectives?: string
}): Promise<ActionResult<{ id: string }>> {
  try {
    const topic = await prisma.weekTopic.create({ data })
    revalidatePath(`/units/${data.unitId}`)
    return { success: true, data: { id: topic.id } }
  } catch {
    return { success: false, error: "Failed to create week topic" }
  }
}

export async function updateWeekTopic(
  id: string,
  unitId: string,
  data: { title?: string; objectives?: string }
): Promise<ActionResult<null>> {
  try {
    await prisma.weekTopic.update({ where: { id }, data })
    revalidatePath(`/units/${unitId}`)
    return { success: true, data: null }
  } catch {
    return { success: false, error: "Failed to update week topic" }
  }
}

export async function deleteWeekTopic(
  id: string,
  unitId: string
): Promise<ActionResult<null>> {
  try {
    // Concepts cascade-delete via foreign key; delete them first explicitly
    await prisma.concept.deleteMany({ where: { weekTopicId: id } })
    await prisma.weekTopic.delete({ where: { id } })
    revalidatePath(`/units/${unitId}`)
    return { success: true, data: null }
  } catch {
    return { success: false, error: "Failed to delete week topic" }
  }
}

// ── Concepts ──────────────────────────────────────────────

export async function createConcept(data: {
  weekTopicId: string
  unitId: string
  front: string
  back: string
  source?: string
}): Promise<ActionResult<{ id: string }>> {
  const { unitId, ...conceptData } = data
  try {
    const concept = await prisma.concept.create({ data: conceptData })
    revalidatePath(`/units/${unitId}`)
    return { success: true, data: { id: concept.id } }
  } catch {
    return { success: false, error: "Failed to create concept" }
  }
}

export async function updateConcept(
  id: string,
  unitId: string,
  data: { front?: string; back?: string; source?: string }
): Promise<ActionResult<null>> {
  try {
    await prisma.concept.update({ where: { id }, data })
    revalidatePath(`/units/${unitId}`)
    return { success: true, data: null }
  } catch {
    return { success: false, error: "Failed to update concept" }
  }
}

export async function deleteConcept(
  id: string,
  unitId: string
): Promise<ActionResult<null>> {
  try {
    await prisma.concept.delete({ where: { id } })
    revalidatePath(`/units/${unitId}`)
    return { success: true, data: null }
  } catch {
    return { success: false, error: "Failed to delete concept" }
  }
}
