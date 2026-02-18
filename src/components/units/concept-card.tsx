"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteConcept } from "@/app/units/[id]/actions"

interface ConceptCardProps {
  id: string
  front: string
  back: string
  source: string | null
  unitId: string
}

export function ConceptCard({ id, front, back, source, unitId }: ConceptCardProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("Delete this concept? Its review history will also be lost.")) return
    startTransition(() => { void deleteConcept(id, unitId) })
  }

  return (
    <div
      className={`relative group grid grid-cols-2 gap-3 rounded-lg border bg-card px-4 py-3 text-sm transition-opacity ${
        isPending ? "opacity-50" : ""
      }`}
    >
      {/* Front */}
      <div className="min-w-0">
        <p className="mb-0.5 text-xs font-medium text-muted-foreground">Front</p>
        <p className="leading-snug">{front}</p>
        {source && (
          <p className="mt-1 text-xs text-muted-foreground/70 italic">{source}</p>
        )}
      </div>

      {/* Back */}
      <div className="min-w-0 border-l pl-3">
        <p className="mb-0.5 text-xs font-medium text-muted-foreground">Back</p>
        <p className="leading-snug text-muted-foreground">{back}</p>
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="sr-only">Delete concept</span>
      </Button>
    </div>
  )
}
