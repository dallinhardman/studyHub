"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createConcept } from "@/app/units/[id]/actions"

interface AddConceptDialogProps {
  weekTopicId: string
  unitId: string
}

export function AddConceptDialog({ weekTopicId, unitId }: AddConceptDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [source, setSource] = useState("")

  function reset() {
    setFront("")
    setBack("")
    setSource("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    startTransition(async () => {
      const res = await createConcept({
        weekTopicId,
        unitId,
        front: front.trim(),
        back: back.trim(),
        source: source.trim() || undefined,
      })
      if (res.success) {
        setOpen(false)
        reset()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add Concept
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Concept</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="front">Front (Question / Term)</Label>
            <Textarea
              id="front"
              placeholder="What is Big O notation?"
              rows={2}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="back">Back (Answer / Definition)</Label>
            <Textarea
              id="back"
              placeholder="A mathematical notation describing the limiting behaviour of a function…"
              rows={3}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="source">
              Source{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="source"
              placeholder="Lecture 1, slide 12"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setOpen(false); reset() }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !front.trim() || !back.trim()}
            >
              {isPending ? "Adding…" : "Add Concept"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
