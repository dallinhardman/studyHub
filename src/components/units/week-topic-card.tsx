"use client"

import { useState, useTransition } from "react"
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { AddConceptDialog } from "@/components/units/add-concept-dialog"
import { ConceptCard } from "@/components/units/concept-card"
import { deleteWeekTopic } from "@/app/units/[id]/actions"
import type { ConceptRow } from "@/app/units/[id]/actions"

interface WeekTopicCardProps {
  id: string
  weekNumber: number
  title: string
  objectives: string | null
  concepts: ConceptRow[]
  unitId: string
  defaultOpen?: boolean
}

export function WeekTopicCard({
  id,
  weekNumber,
  title,
  objectives,
  concepts,
  unitId,
  defaultOpen = false,
}: WeekTopicCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (
      !confirm(
        `Delete "Week ${weekNumber}: ${title}"? All concepts in this week will also be deleted.`
      )
    )
      return
    startTransition(() => { void deleteWeekTopic(id, unitId) })
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={`rounded-xl border bg-card transition-opacity ${
          isPending ? "opacity-50" : ""
        }`}
      >
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-3">
          <CollapsibleTrigger asChild>
            <button className="flex flex-1 items-center gap-2.5 text-left">
              {open ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="text-xs font-semibold text-muted-foreground w-14 shrink-0">
                Week {weekNumber}
              </span>
              <span className="font-medium truncate">{title}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {concepts.length} concept{concepts.length !== 1 ? "s" : ""}
              </span>
            </button>
          </CollapsibleTrigger>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete week</span>
          </Button>
        </div>

        {/* Collapsible body */}
        <CollapsibleContent>
          <div className="border-t px-4 pb-4 pt-3 space-y-3">
            {/* Objectives */}
            {objectives && (
              <p className="text-sm text-muted-foreground rounded-md bg-muted/50 px-3 py-2">
                {objectives}
              </p>
            )}

            {/* Concept list */}
            {concepts.length > 0 ? (
              <div className="space-y-2">
                {concepts.map((c) => (
                  <ConceptCard
                    key={c.id}
                    id={c.id}
                    front={c.front}
                    back={c.back}
                    source={c.source}
                    unitId={unitId}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No concepts yet.
              </p>
            )}

            {/* Add concept */}
            <div className="pt-1">
              <AddConceptDialog weekTopicId={id} unitId={unitId} />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
