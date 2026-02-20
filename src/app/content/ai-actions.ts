"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import {
  extractTextFromFile,
  buildSummaryPrompt,
  buildMCQPrompt,
  buildFlashcardPrompt,
  callAI,
} from "@/lib/ai-client"
import type { ActionResult } from "@/types"

// ── Summarise ─────────────────────────────────────────────

export async function summariseContent(
  contentId: string
): Promise<ActionResult<{ summary: string }>> {
  try {
    const item = await prisma.content.findUniqueOrThrow({
      where: { id: contentId },
      include: { weekTopic: { select: { unit: { select: { code: true } } } } },
    })

    if (!item.fileUrl) {
      return { success: false, error: "No file attached to this content item" }
    }

    const text = await extractTextFromFile(item.fileUrl)
    if (!text.trim()) {
      return { success: false, error: "Could not extract text from file" }
    }

    const prompt = buildSummaryPrompt(item.title, text)
    const summary = await callAI(prompt)

    await prisma.content.update({
      where: { id: contentId },
      data: { aiSummary: summary },
    })

    revalidatePath("/content")
    return { success: true, data: { summary } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Summarisation failed"
    return { success: false, error: msg }
  }
}

// ── Generate MCQs ─────────────────────────────────────────

interface GeneratedMCQ {
  question: string
  options: string[]
  answer: string
  explanation: string
}

export async function generateMCQs(
  contentId: string,
  count: number = 5
): Promise<ActionResult<{ quizId: string; questionCount: number }>> {
  try {
    const item = await prisma.content.findUniqueOrThrow({
      where: { id: contentId },
      include: {
        weekTopic: {
          include: { unit: true },
        },
      },
    })

    // Use existing summary or extract + summarise on the fly
    let summary = item.aiSummary
    if (!summary) {
      if (!item.fileUrl) {
        return { success: false, error: "No file or summary available for MCQ generation" }
      }
      const text = await extractTextFromFile(item.fileUrl)
      const summaryPrompt = buildSummaryPrompt(item.title, text)
      summary = await callAI(summaryPrompt)
      await prisma.content.update({ where: { id: contentId }, data: { aiSummary: summary } })
    }

    const prompt = buildMCQPrompt(item.title, summary, count)
    const raw = await callAI(prompt)

    let questions: GeneratedMCQ[]
    try {
      // Strip possible markdown fences
      const json = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
      questions = JSON.parse(json)
    } catch {
      return { success: false, error: "AI returned invalid JSON for MCQs" }
    }

    // Create quiz + questions in one transaction
    const quiz = await prisma.quiz.create({
      data: {
        title: `${item.title} – MCQ Quiz`,
        aiGenerated: true,
        unitId: item.weekTopic.unit.id,
        questions: {
          create: questions.map((q) => ({
            questionText: q.question,
            type: "MCQ",
            options: JSON.stringify(q.options),
            answer: q.answer,
          })),
        },
      },
      include: { questions: true },
    })

    revalidatePath("/content")
    revalidatePath("/quizzes")
    return { success: true, data: { quizId: quiz.id, questionCount: quiz.questions.length } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "MCQ generation failed"
    return { success: false, error: msg }
  }
}

// ── Generate Flashcards ───────────────────────────────────

interface GeneratedFlashcard {
  front: string
  back: string
}

export async function generateFlashcards(
  contentId: string,
  count: number = 5
): Promise<ActionResult<{ created: number }>> {
  try {
    const item = await prisma.content.findUniqueOrThrow({
      where: { id: contentId },
      include: { weekTopic: true },
    })

    let summary = item.aiSummary
    if (!summary) {
      if (!item.fileUrl) {
        return { success: false, error: "No file or summary available" }
      }
      const text = await extractTextFromFile(item.fileUrl)
      const summaryPrompt = buildSummaryPrompt(item.title, text)
      summary = await callAI(summaryPrompt)
      await prisma.content.update({ where: { id: contentId }, data: { aiSummary: summary } })
    }

    const prompt = buildFlashcardPrompt(item.title, summary, count)
    const raw = await callAI(prompt)

    let cards: GeneratedFlashcard[]
    try {
      const json = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
      cards = JSON.parse(json)
    } catch {
      return { success: false, error: "AI returned invalid JSON for flashcards" }
    }

    const now = new Date()
    await prisma.concept.createMany({
      data: cards.map((c) => ({
        front: c.front,
        back: c.back,
        source: item.title,
        weekTopicId: item.weekTopicId,
        contentId,
        nextReviewDate: now,
      })),
    })

    revalidatePath("/content")
    revalidatePath("/study")
    return { success: true, data: { created: cards.length } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Flashcard generation failed"
    return { success: false, error: msg }
  }
}
