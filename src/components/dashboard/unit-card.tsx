"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Archive, ArchiveRestore, BookOpen, Brain, MoreHorizontal, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toggleArchiveUnit, deleteUnit } from "@/app/dashboard/actions"

interface UnitCardProps {
  id: string
  code: string
  name: string
  color: string | null
  isArchived: boolean
  topicCount: number
  quizCount: number
}

// Tailwind-safe colour map (dynamic class generation doesn't work with Tailwind)
const colorMap: Record<string, { bar: string; badge: string }> = {
  blue:   { bar: "bg-blue-500",   badge: "bg-blue-100 text-blue-700" },
  green:  { bar: "bg-green-500",  badge: "bg-green-100 text-green-700" },
  violet: { bar: "bg-violet-500", badge: "bg-violet-100 text-violet-700" },
  orange: { bar: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  rose:   { bar: "bg-rose-500",   badge: "bg-rose-100 text-rose-700" },
  cyan:   { bar: "bg-cyan-500",   badge: "bg-cyan-100 text-cyan-700" },
  amber:  { bar: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
  slate:  { bar: "bg-slate-500",  badge: "bg-slate-100 text-slate-700" },
}

export function UnitCard({
  id,
  code,
  name,
  color,
  isArchived,
  topicCount,
  quizCount,
}: UnitCardProps) {
  const [isPending, startTransition] = useTransition()
  const [archived, setArchived] = useState(isArchived)

  const colours = colorMap[color ?? "slate"] ?? colorMap.slate

  function handleArchiveToggle() {
    startTransition(async () => {
      const next = !archived
      setArchived(next)
      await toggleArchiveUnit(id, next)
    })
  }

  function handleDelete() {
    if (!confirm(`Delete "${code} – ${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteUnit(id)
    })
  }

  return (
    <Card className={`relative overflow-hidden transition-opacity ${isPending ? "opacity-60" : ""} ${archived ? "opacity-70" : ""}`}>
      {/* Colour accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${colours.bar}`} />

      <CardHeader className="pl-5 pr-3 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Badge className={`mb-1.5 text-xs font-semibold border-0 ${colours.badge}`}>
              {code}
            </Badge>
            <CardTitle className="truncate text-base leading-snug">
              {name}
            </CardTitle>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 mt-0.5">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Unit options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchiveToggle}>
                {archived ? (
                  <><ArchiveRestore className="mr-2 h-4 w-4" /> Unarchive</>
                ) : (
                  <><Archive className="mr-2 h-4 w-4" /> Archive</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pl-5 pb-3">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {topicCount} topic{topicCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Brain className="h-3.5 w-3.5" />
            {quizCount} quiz{quizCount !== 1 ? "zes" : ""}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pl-5 pb-4 pt-0">
        <Link href={`/units/${id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full text-xs">
            Open Unit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
