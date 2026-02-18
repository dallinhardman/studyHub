"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { calculateNextReview, type ReviewGrade } from "@/lib/srs/sm2"
import { ensureMockUser } from "@/lib/ensure-mock-user"
import type { ActionResult } from "@/types"

// ── Types ─────────────────────────────────────────────────

export interface DueConcept {
  id: string
  front: string
  back: string
  source: string | null
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: Date
  unitCode: string
  unitColor: string | null
  weekTitle: string
}

export interface SessionSummary {
  totalReviewed: number
  averageGrade: number
  correctCount: number
  incorrectCount: number
}

// ── Queries ───────────────────────────────────────────────

export async function getDueConcepts(userId: string): Promise<DueConcept[]> {
  const now = new Date()
  now.setHours(23, 59, 59, 999) // Include everything due today

  // Get all units belonging to the user's semesters (not archived)
  const rows = await prisma.concept.findMany({
    where: {
      nextReviewDate: { lte: now },
      weekTopic: {
        unit: {
          isArchived: false,
          semester: { userId },
        },
      },
    },
    orderBy: { nextReviewDate: "asc" },
    include: {
      weekTopic: {
        select: {
          title: true,
          unit: { select: { code: true, color: true } },
        },
      },
    },
  })

  return rows.map((r) => ({
    id: r.id,
    front: r.front,
    back: r.back,
    source: r.source,
    easeFactor: r.easeFactor,
    interval: r.interval,
    repetitions: r.repetitions,
    nextReviewDate: r.nextReviewDate,
    unitCode: r.weekTopic?.unit.code ?? "—",
    unitColor: r.weekTopic?.unit.color ?? null,
    weekTitle: r.weekTopic?.title ?? "—",
  })) as DueConcept[]
}

export async function getDueCount(userId: string): Promise<number> {
  const now = new Date()
  now.setHours(23, 59, 59, 999)

  return prisma.concept.count({
    where: {
      nextReviewDate: { lte: now },
      weekTopic: {
        unit: {
          isArchived: false,
          semester: { userId },
        },
      },
    },
  })
}

// ── Review Session ────────────────────────────────────────

export async function startReviewSession(
  userId: string
): Promise<ActionResult<{ sessionId: string }>> {
  try {
    await ensureMockUser()
    const session = await prisma.reviewSession.create({
      data: { userId },
    })
    return { success: true, data: { sessionId: session.id } }
  } catch {
    return { success: false, error: "Failed to start review session" }
  }
}

export async function submitReview(data: {
  conceptId: string
  sessionId: string
  grade: ReviewGrade
}): Promise<ActionResult<null>> {
  const { conceptId, sessionId, grade } = data

  try {
    // Fetch current SRS state
    const concept = await prisma.concept.findUniqueOrThrow({
      where: { id: conceptId },
    })

    const currentState = {
      easeFactor: concept.easeFactor,
      interval: concept.interval,
      repetitions: concept.repetitions,
      nextReviewDate: concept.nextReviewDate,
    }

    // Calculate new state using SM-2
    const newState = calculateNextReview(currentState, grade)

    // Persist both the updated concept and the review log
    await prisma.$transaction([
      prisma.concept.update({
        where: { id: conceptId },
        data: {
          easeFactor: newState.easeFactor,
          interval: newState.interval,
          repetitions: newState.repetitions,
          nextReviewDate: newState.nextReviewDate,
          lastReviewedAt: new Date(),
        },
      }),
      prisma.reviewLog.create({
        data: {
          grade,
          previousInterval: currentState.interval,
          newInterval: newState.interval,
          conceptId,
          sessionId,
        },
      }),
    ])

    revalidatePath("/study")
    revalidatePath("/dashboard")
    return { success: true, data: null }
  } catch {
    return { success: false, error: "Failed to submit review" }
  }
}

export async function endReviewSession(
  sessionId: string
): Promise<ActionResult<SessionSummary>> {
  try {
    await prisma.reviewSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    })

    const logs = await prisma.reviewLog.findMany({
      where: { sessionId },
    })

    const totalReviewed = logs.length
    const averageGrade =
      totalReviewed > 0
        ? logs.reduce((sum, l) => sum + l.grade, 0) / totalReviewed
        : 0
    const correctCount = logs.filter((l) => l.grade >= 3).length
    const incorrectCount = totalReviewed - correctCount

    revalidatePath("/study")
    return {
      success: true,
      data: { totalReviewed, averageGrade, correctCount, incorrectCount },
    }
  } catch {
    return { success: false, error: "Failed to end session" }
  }
}
