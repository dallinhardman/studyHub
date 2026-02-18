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
import { createWeekTopic } from "@/app/units/[id]/actions"

interface AddWeekTopicDialogProps {
  unitId: string
  nextWeekNumber: number
}

export function AddWeekTopicDialog({
  unitId,
  nextWeekNumber,
}: AddWeekTopicDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [weekNumber, setWeekNumber] = useState(nextWeekNumber)
  const [title, setTitle] = useState("")
  const [objectives, setObjectives] = useState("")

  function reset() {
    setWeekNumber(nextWeekNumber)
    setTitle("")
    setObjectives("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      const res = await createWeekTopic({
        unitId,
        weekNumber,
        title: title.trim(),
        objectives: objectives.trim() || undefined,
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
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Week
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Week Topic</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex gap-3">
            <div className="w-24 space-y-1.5">
              <Label htmlFor="weekNum">Week</Label>
              <Input
                id="weekNum"
                type="number"
                min={1}
                max={52}
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="topicTitle">Title</Label>
              <Input
                id="topicTitle"
                placeholder="e.g. Introduction to Algorithms"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="objectives">
              Learning Objectives{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="objectives"
              placeholder="What should you know after this week?"
              rows={3}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
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
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Adding…" : "Add Week"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
