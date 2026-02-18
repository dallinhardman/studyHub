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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUnit, createSemester } from "@/app/dashboard/actions"

interface Semester {
  id: string
  name: string
  year: number
}

interface AddUnitDialogProps {
  semesters: Semester[]
  currentSemesterId?: string
  userId: string
}

const COLOURS = [
  { value: "blue",   label: "Blue" },
  { value: "green",  label: "Green" },
  { value: "violet", label: "Violet" },
  { value: "orange", label: "Orange" },
  { value: "rose",   label: "Rose" },
  { value: "cyan",   label: "Cyan" },
  { value: "amber",  label: "Amber" },
  { value: "slate",  label: "Slate" },
]

const dotClass: Record<string, string> = {
  blue: "bg-blue-500", green: "bg-green-500", violet: "bg-violet-500",
  orange: "bg-orange-500", rose: "bg-rose-500", cyan: "bg-cyan-500",
  amber: "bg-amber-500", slate: "bg-slate-500",
}

export function AddUnitDialog({
  semesters,
  currentSemesterId,
  userId,
}: AddUnitDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [color, setColor] = useState("blue")
  const [semesterId, setSemesterId] = useState(currentSemesterId ?? "")

  // New semester quick-add
  const [showNewSem, setShowNewSem] = useState(semesters.length === 0)
  const [semName, setSemName] = useState("")
  const [semYear, setSemYear] = useState(new Date().getFullYear())

  function reset() {
    setCode("")
    setName("")
    setColor("blue")
    setSemesterId(currentSemesterId ?? "")
    setSemName("")
    setSemYear(new Date().getFullYear())
    setShowNewSem(semesters.length === 0)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || !name.trim()) return

    startTransition(async () => {
      let targetSemesterId = semesterId

      // Create semester on-the-fly if needed
      if (showNewSem || !targetSemesterId) {
        const year = semYear
        const startDate = new Date(`${year}-01-01`)
        const endDate = new Date(`${year}-12-31`)
        const res = await createSemester({
          userId,
          name: semName || `Semester ${year}`,
          year,
          startDate,
          endDate,
        })
        if (!res.success) return
        targetSemesterId = res.data!.id
      }

      const res = await createUnit({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        color,
        semesterId: targetSemesterId,
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
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Unit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Unit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Unit Code */}
          <div className="space-y-1.5">
            <Label htmlFor="code">Unit Code</Label>
            <Input
              id="code"
              placeholder="e.g. CAB201"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          {/* Unit Name */}
          <div className="space-y-1.5">
            <Label htmlFor="uname">Unit Name</Label>
            <Input
              id="uname"
              placeholder="e.g. Programming Principles"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Colour */}
          <div className="space-y-1.5">
            <Label>Colour</Label>
            <div className="flex flex-wrap gap-2">
              {COLOURS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => setColor(value)}
                  className={`h-6 w-6 rounded-full ${dotClass[value]} ring-offset-2 transition-all ${
                    color === value ? "ring-2 ring-ring" : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Semester */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Semester</Label>
              {semesters.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline"
                  onClick={() => setShowNewSem((v) => !v)}
                >
                  {showNewSem ? "Pick existing" : "+ New semester"}
                </button>
              )}
            </div>

            {!showNewSem && semesters.length > 0 ? (
              <Select value={semesterId} onValueChange={setSemesterId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Semester 1, 2026"
                  value={semName}
                  onChange={(e) => setSemName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={semYear}
                  onChange={(e) => setSemYear(Number(e.target.value))}
                  className="w-20"
                  min={2020}
                  max={2035}
                />
              </div>
            )}
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
            <Button type="submit" disabled={isPending || !code.trim() || !name.trim()}>
              {isPending ? "Adding…" : "Add Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
