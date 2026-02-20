/**
 * Thin AI client that tries Gemini first, falls back to Claude.
 * Both are optional — if neither key is set the caller gets a clear error.
 */

import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

// ── PDF text extraction ────────────────────────────────────

export async function extractTextFromFile(fileUrl: string): Promise<string> {
  if (!fileUrl.startsWith("/api/uploads/")) {
    throw new Error("Only local uploads are supported for text extraction")
  }

  const rel = fileUrl.replace("/api/uploads/", "")
  const absPath = path.join(process.cwd(), "uploads", rel)

  if (!existsSync(absPath)) throw new Error("File not found on disk")

  const ext = path.extname(absPath).toLowerCase()

  if (ext === ".pdf") {
    // Dynamically imported so it doesn't break SSR when not needed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse")
    const buffer = await readFile(absPath)
    const data = await pdfParse(buffer)
    return data.text as string
  }

  if ([".txt", ".md"].includes(ext)) {
    return (await readFile(absPath, "utf-8")) as string
  }

  throw new Error(
    `Text extraction not supported for ${ext} files. Supported: PDF, TXT, MD`
  )
}

// ── Prompt templates ──────────────────────────────────────

export function buildSummaryPrompt(title: string, text: string): string {
  const excerpt = text.slice(0, 12000) // keep within token budget
  return `You are a study assistant for a university student.
Summarise the following study material titled "${title}" into clear, concise bullet points.
Focus on key concepts, definitions, and important facts a student should know for an exam.
Return ONLY the summary — no preamble, no meta-commentary.

--- CONTENT START ---
${excerpt}
--- CONTENT END ---`
}

export function buildMCQPrompt(
  title: string,
  summary: string,
  count: number
): string {
  return `You are a university exam question generator.
Based on the following study material summary for "${title}", generate exactly ${count} multiple-choice questions.

Return ONLY a valid JSON array. No markdown fences, no explanation.
Each object must have:
  - "question": string
  - "options": array of exactly 4 strings (A, B, C, D)
  - "answer": the full text of the correct option (must match one of "options")
  - "explanation": one sentence explaining why the answer is correct

Example format:
[{"question":"...","options":["A...","B...","C...","D..."],"answer":"A...","explanation":"..."}]

--- SUMMARY ---
${summary}
--- END ---`
}

export function buildFlashcardPrompt(
  title: string,
  summary: string,
  count: number
): string {
  return `You are a university study flashcard generator.
Based on the following study material summary for "${title}", generate exactly ${count} flashcards.

Return ONLY a valid JSON array. No markdown fences, no explanation.
Each object must have:
  - "front": the question or term (concise)
  - "back": the answer or definition (1–3 sentences)

--- SUMMARY ---
${summary}
--- END ---`
}

// ── AI Client ─────────────────────────────────────────────

export async function callAI(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (geminiKey) {
    return callGemini(prompt, geminiKey)
  }
  if (anthropicKey) {
    return callClaude(prompt, anthropicKey)
  }

  throw new Error(
    "No AI API key configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY in .env"
  )
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai")
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default
  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  })
  const block = message.content[0]
  if (block.type !== "text") throw new Error("Unexpected response type from Claude")
  return block.text
}
