"use client"

import { useState, useTransition } from "react"
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  summariseContent,
  generateMCQs,
  generateFlashcards,
} from "@/app/content/ai-actions"

interface AIPanelProps {
  contentId: string
  initialSummary: string | null
  mimeType: string | null
}

type Status = "idle" | "loading" | "success" | "error"

interface TaskState {
  status: Status
  message: string
}

function canExtract(mimeType: string | null): boolean {
  if (!mimeType) return false
  return (
    mimeType === "application/pdf" ||
    mimeType.startsWith("text/")
  )
}

export function AIPanel({ contentId, initialSummary, mimeType }: AIPanelProps) {
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState(initialSummary)
  const [summariseState, setSummariseState] = useState<TaskState>({ status: "idle", message: "" })
  const [mcqState, setMcqState] = useState<TaskState>({ status: "idle", message: "" })
  const [flashcardState, setFlashcardState] = useState<TaskState>({ status: "idle", message: "" })
  const [, startTransition] = useTransition()

  const extractable = canExtract(mimeType)

  function handleSummarise() {
    setSummariseState({ status: "loading", message: "" })
    startTransition(async () => {
      const res = await summariseContent(contentId)
      if (res.success) {
        setSummary(res.data.summary)
        setSummariseState({ status: "success", message: "Summary saved" })
      } else {
        setSummariseState({ status: "error", message: res.error })
      }
    })
  }

  function handleMCQ() {
    setMcqState({ status: "loading", message: "" })
    startTransition(async () => {
      const res = await generateMCQs(contentId, 5)
      if (res.success) {
        setMcqState({
          status: "success",
          message: `${res.data.questionCount} questions created`,
        })
      } else {
        setMcqState({ status: "error", message: res.error })
      }
    })
  }

  function handleFlashcards() {
    setFlashcardState({ status: "loading", message: "" })
    startTransition(async () => {
      const res = await generateFlashcards(contentId, 5)
      if (res.success) {
        setFlashcardState({
          status: "success",
          message: `${res.data.created} flashcards added to review queue`,
        })
      } else {
        setFlashcardState({ status: "error", message: res.error })
      }
    })
  }

  return (
    <div className="mt-2 rounded-lg border bg-muted/30">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI Tools
        {summary && (
          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
            Summary ready
          </Badge>
        )}
        {open ? (
          <ChevronUp className="ml-auto h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="ml-auto h-3.5 w-3.5" />
        )}
      </button>

      {open && (
        <div className="border-t px-3 pb-3 pt-2 space-y-3">
          {!extractable && (
            <p className="text-xs text-muted-foreground italic">
              AI tools work with PDF, TXT, and MD files.
            </p>
          )}

          {/* Summarise */}
          <AIAction
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label={summary ? "Re-summarise" : "Summarise"}
            description="Generate key bullet points from this file"
            state={summariseState}
            disabled={!extractable}
            onClick={handleSummarise}
          />

          {/* Summary preview */}
          {summary && (
            <div className="rounded-md bg-background border p-3 text-xs leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto text-muted-foreground">
              {summary}
            </div>
          )}

          {/* Generate MCQs */}
          <AIAction
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label="Generate MCQ Quiz (5 questions)"
            description="Creates a new quiz under this unit"
            state={mcqState}
            disabled={!extractable}
            onClick={handleMCQ}
          />

          {/* Generate Flashcards */}
          <AIAction
            icon={<BookOpen className="h-3.5 w-3.5" />}
            label="Generate Flashcards (5 cards)"
            description="Adds cards to your SRS review queue"
            state={flashcardState}
            disabled={!extractable}
            onClick={handleFlashcards}
          />
        </div>
      )}
    </div>
  )
}

// ── Reusable action row ────────────────────────────────────

interface AIActionProps {
  icon: React.ReactNode
  label: string
  description: string
  state: TaskState
  disabled: boolean
  onClick: () => void
}

function AIAction({ icon, label, description, state, disabled, onClick }: AIActionProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium flex items-center gap-1.5">
          {icon}
          {label}
        </p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
        {state.status === "success" && (
          <p className="mt-0.5 text-[11px] text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {state.message}
          </p>
        )}
        {state.status === "error" && (
          <p className="mt-0.5 text-[11px] text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {state.message}
          </p>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-7 shrink-0 text-xs"
        disabled={disabled || state.status === "loading"}
        onClick={onClick}
      >
        {state.status === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "Run"
        )}
      </Button>
    </div>
  )
}
