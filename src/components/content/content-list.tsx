"use client"

import { useTransition } from "react"
import {
  FileText,
  FileVideo,
  FileAudio,
  FileImage,
  File,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { deleteContent } from "@/app/content/actions"
import type { UnitGroup } from "@/app/content/actions"
import type { ContentType } from "@/types"

// ── Helpers ────────────────────────────────────────────────

const colorBadge: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  violet: "bg-violet-100 text-violet-700",
  orange: "bg-orange-100 text-orange-700",
  rose: "bg-rose-100 text-rose-700",
  cyan: "bg-cyan-100 text-cyan-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
}

const typeBadge: Record<ContentType, string> = {
  LECTURE: "bg-blue-50 text-blue-600",
  TUTORIAL: "bg-violet-50 text-violet-600",
  READING: "bg-amber-50 text-amber-600",
  ASSIGNMENT: "bg-rose-50 text-rose-600",
  OTHER: "bg-slate-50 text-slate-600",
}

const typeLabel: Record<ContentType, string> = {
  LECTURE: "Lecture",
  TUTORIAL: "Tutorial",
  READING: "Reading",
  ASSIGNMENT: "Assignment",
  OTHER: "Other",
}

function FileIcon({ mimeType }: { mimeType: string | null }) {
  const m = mimeType ?? ""
  if (m.startsWith("image/")) return <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />
  if (m.startsWith("video/")) return <FileVideo className="h-4 w-4 shrink-0 text-muted-foreground" />
  if (m.startsWith("audio/")) return <FileAudio className="h-4 w-4 shrink-0 text-muted-foreground" />
  if (m === "application/pdf" || m.includes("text")) return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
  return <File className="h-4 w-4 shrink-0 text-muted-foreground" />
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ── Delete Button ──────────────────────────────────────────

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteContent(id)
        })
      }
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  )
}

// ── Main Component ─────────────────────────────────────────

interface ContentListProps {
  units: UnitGroup[]
}

export function ContentList({ units }: ContentListProps) {
  if (units.length === 0) return null

  return (
    <div className="space-y-6">
      {units.map((unit) => {
        const badge = colorBadge[unit.unitColor ?? "slate"] ?? colorBadge.slate
        const totalItems = unit.weeks.reduce((s, w) => s + w.items.length, 0)

        return (
          <section key={unit.unitId}>
            {/* Unit header */}
            <div className="mb-3 flex items-center gap-2">
              <Badge className={`border-0 text-xs ${badge}`}>{unit.unitCode}</Badge>
              <span className="text-sm font-medium">{unit.unitName}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {totalItems} file{totalItems !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Week accordion */}
            <Accordion type="multiple" defaultValue={unit.weeks.map((w) => w.weekTopicId)} className="space-y-1">
              {unit.weeks.map((week) => (
                <AccordionItem
                  key={week.weekTopicId}
                  value={week.weekTopicId}
                  className="rounded-lg border bg-card px-4"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Week {week.weekNumber}</span>
                      <span className="text-muted-foreground">—</span>
                      <span className="text-muted-foreground">{week.weekTitle}</span>
                      <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">
                        {week.items.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-3">
                    <ul className="space-y-2">
                      {week.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                        >
                          <FileIcon mimeType={item.mimeType} />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(item.uploadedAt)}
                            </p>
                          </div>

                          <Badge
                            className={`border-0 text-[10px] shrink-0 ${typeBadge[item.type as ContentType]}`}
                          >
                            {typeLabel[item.type as ContentType]}
                          </Badge>

                          {item.fileUrl && (
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}

                          <DeleteButton id={item.id} />
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )
      })}
    </div>
  )
}
