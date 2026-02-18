"use client"

import { useState, useTransition } from "react"
import { Settings } from "lucide-react"
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
import { updateUnit } from "@/app/units/[id]/actions"

interface EditUnitDialogProps {
  unitId: string
  initialCode: string
  initialName: string
  initialColor: string | null
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

export function EditUnitDialog({
  unitId,
  initialCode,
  initialName,
  initialColor,
}: EditUnitDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [code, setCode] = useState(initialCode)
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(initialColor ?? "slate")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || !name.trim()) return
    startTransition(async () => {
      const res = await updateUnit(unitId, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        color,
      })
      if (res.success) setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings className="h-4 w-4" />
          Edit Unit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Unit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="eCode">Unit Code</Label>
            <Input
              id="eCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eName">Unit Name</Label>
            <Input
              id="eName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
                    color === value
                      ? "ring-2 ring-ring"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
