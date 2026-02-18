/**
 * Shared TypeScript types for StudyHub.
 *
 * Prisma-generated types live in @/generated/prisma.
 * This file provides domain-level aliases, unions, and utility types.
 */

export type { SRSState, ReviewGrade } from "@/lib/srs/sm2";

// ── Content ───────────────────────────────────────────────────────────────────

/** Maps to the `type` String field on the Content model. */
export type ContentType =
  | "LECTURE"
  | "TUTORIAL"
  | "READING"
  | "ASSIGNMENT"
  | "OTHER";

// ── Quiz ──────────────────────────────────────────────────────────────────────

/** Maps to the `type` String field on the QuizQuestion model. */
export type QuestionType = "MCQ" | "SHORT_ANSWER" | "TRUE_FALSE";

/** Parsed MCQ options (stored as JSON string in DB). */
export type MCQOption = {
  id: string;
  text: string;
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

/** Summary card shown per unit on the dashboard. */
export type UnitSummary = {
  id: string;
  code: string;
  name: string;
  color: string;
  isArchived: boolean;
  weekCount: number;
  contentCount: number;
  dueReviewCount: number;
};

// ── Utility ───────────────────────────────────────────────────────────────────

/** Generic async action result used in server actions. */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
