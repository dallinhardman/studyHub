"use client"

import { useState, useTransition } from "react"
import { Check, Eye, RotateCcw, Trophy, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  startReviewSession,
  submitReview,
  endReviewSession,
  type DueConcept,
  type SessionSummary,
} from "@/app/study/actions"
import type { ReviewGrade } from "@/lib/srs/sm2"

const colorBadge: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700", green: "bg-green-100 text-green-700",
  violet: "bg-violet-100 text-violet-700", orange: "bg-orange-100 text-orange-700",
  rose: "bg-rose-100 text-rose-700", cyan: "bg-cyan-100 text-cyan-700",
  amber: "bg-amber-100 text-amber-700", slate: "bg-slate-100 text-slate-700",
}

const gradeButtons: { grade: ReviewGrade; label: string; desc: string; style: string }[] = [
  { grade: 0, label: "0", desc: "Blackout", style: "border-red-300 hover:bg-red-50 text-red-700" },
  { grade: 1, label: "1", desc: "Wrong", style: "border-orange-300 hover:bg-orange-50 text-orange-700" },
  { grade: 2, label: "2", desc: "Barely", style: "border-amber-300 hover:bg-amber-50 text-amber-700" },
  { grade: 3, label: "3", desc: "Hard", style: "border-yellow-300 hover:bg-yellow-50 text-yellow-700" },
  { grade: 4, label: "4", desc: "Good", style: "border-lime-300 hover:bg-lime-50 text-lime-700" },
  { grade: 5, label: "5", desc: "Perfect", style: "border-green-300 hover:bg-green-50 text-green-700" },
]

interface ReviewFlowProps {
  concepts: DueConcept[]
  userId: string
}

type Phase = "idle" | "reviewing" | "done"

export function ReviewFlow({ concepts, userId }: ReviewFlowProps) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [queue, setQueue] = useState<DueConcept[]>(concepts)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [isPending, startTransition] = useTransition()

  const current = queue[currentIdx]
  const remaining = queue.length - currentIdx

  async function handleStart() {
    startTransition(async () => {
      const res = await startReviewSession(userId)
      if (res.success && res.data) {
        setSessionId(res.data.sessionId)
        setPhase("reviewing")
        setCurrentIdx(0)
        setRevealed(false)
      }
    })
  }

  function handleGrade(grade: ReviewGrade) {
    if (!sessionId || !current) return
    startTransition(async () => {
      await submitReview({ conceptId: current.id, sessionId, grade })

      const next = currentIdx + 1
      if (next >= queue.length) {
        // All done
        const res = await endReviewSession(sessionId)
        if (res.success && res.data) {
          setSummary(res.data)
        }
        setPhase("done")
      } else {
        setCurrentIdx(next)
        setRevealed(false)
      }
    })
  }

  function handleRestart() {
    // Reload to get fresh due concepts from server
    window.location.reload()
  }

  // ── Idle ───────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <RotateCcw className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-1">
          {queue.length} concept{queue.length !== 1 ? "s" : ""} due
        </h2>
        <p className="mb-6 text-sm text-muted-foreground max-w-sm">
          Review each flashcard and rate how well you remembered it. The SM-2
          algorithm will schedule your next review accordingly.
        </p>
        <Button onClick={handleStart} disabled={isPending} size="lg">
          {isPending ? "Starting…" : "Start Review"}
        </Button>
      </div>
    )
  }

  // ── Done ───────────────────────────────────────────
  if (phase === "done" && summary) {
    const pct = summary.totalReviewed > 0
      ? Math.round((summary.correctCount / summary.totalReviewed) * 100)
      : 0
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Trophy className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-1">Session Complete</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Great work! Here&apos;s how you did.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8 text-center w-64">
          <Stat label="Reviewed" value={summary.totalReviewed} />
          <Stat label="Avg Grade" value={summary.averageGrade.toFixed(1)} />
          <Stat label="Correct" value={summary.correctCount} icon={<Check className="h-4 w-4 text-green-600" />} />
          <Stat label="Incorrect" value={summary.incorrectCount} icon={<X className="h-4 w-4 text-red-500" />} />
        </div>

        <p className="text-2xl font-bold mb-6">{pct}% accuracy</p>
        <Button onClick={handleRestart} variant="outline">
          Back to Study
        </Button>
      </div>
    )
  }

  // ── Reviewing ──────────────────────────────────────
  if (!current) return null

  const badgeColor = colorBadge[current.unitColor ?? "slate"] ?? colorBadge.slate

  return (
    <div className="mx-auto max-w-xl py-8">
      {/* Progress bar */}
      <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Card {currentIdx + 1} of {queue.length}
        </span>
        <span>{remaining} remaining</span>
      </div>
      <div className="mb-8 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / queue.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge className={`border-0 text-xs ${badgeColor}`}>
              {current.unitCode}
            </Badge>
            <span className="text-xs text-muted-foreground">{current.weekTitle}</span>
          </div>

          {/* Front */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Question</p>
            <p className="text-lg leading-relaxed">{current.front}</p>
          </div>

          {/* Back (revealed) */}
          {revealed ? (
            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Answer</p>
              <p className="text-base leading-relaxed text-muted-foreground">
                {current.back}
              </p>
              {current.source && (
                <p className="mt-2 text-xs italic text-muted-foreground/70">
                  Source: {current.source}
                </p>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2 mt-2"
              onClick={() => setRevealed(true)}
            >
              <Eye className="h-4 w-4" />
              Show Answer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Grade buttons */}
      {revealed && (
        <div>
          <p className="text-sm font-medium text-center mb-3 text-muted-foreground">
            How well did you remember?
          </p>
          <div className="grid grid-cols-6 gap-2">
            {gradeButtons.map(({ grade, label, desc, style }) => (
              <button
                key={grade}
                onClick={() => handleGrade(grade)}
                disabled={isPending}
                className={`flex flex-col items-center rounded-lg border-2 px-1 py-2.5 text-center transition-colors disabled:opacity-50 ${style}`}
              >
                <span className="text-lg font-bold">{label}</span>
                <span className="text-[10px] leading-tight">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="text-lg font-semibold">{value}</span>
      </div>
    </div>
  )
}
