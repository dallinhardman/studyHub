import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, Brain } from "lucide-react"
import { getUnit, getWeekTopics } from "@/app/units/[id]/actions"
import { AddWeekTopicDialog } from "@/components/units/add-week-topic-dialog"
import { EditUnitDialog } from "@/components/units/edit-unit-dialog"
import { WeekTopicCard } from "@/components/units/week-topic-card"
import { Badge } from "@/components/ui/badge"

const colorBar: Record<string, string> = {
  blue: "bg-blue-500", green: "bg-green-500", violet: "bg-violet-500",
  orange: "bg-orange-500", rose: "bg-rose-500", cyan: "bg-cyan-500",
  amber: "bg-amber-500", slate: "bg-slate-500",
}
const colorBadge: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700", green: "bg-green-100 text-green-700",
  violet: "bg-violet-100 text-violet-700", orange: "bg-orange-100 text-orange-700",
  rose: "bg-rose-100 text-rose-700", cyan: "bg-cyan-100 text-cyan-700",
  amber: "bg-amber-100 text-amber-700", slate: "bg-slate-100 text-slate-700",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UnitPage({ params }: PageProps) {
  const { id } = await params
  const [unit, weekTopics] = await Promise.all([getUnit(id), getWeekTopics(id)])

  if (!unit) notFound()

  const colourKey = unit.color ?? "slate"
  const bar = colorBar[colourKey] ?? colorBar.slate
  const badge = colorBadge[colourKey] ?? colorBadge.slate

  const totalConcepts = weekTopics.reduce((n, t) => n + t.concepts.length, 0)
  const nextWeekNumber =
    weekTopics.length > 0
      ? Math.max(...weekTopics.map((t) => t.weekNumber)) + 1
      : 1

  return (
    <div className="px-8 py-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      {/* Unit header */}
      <div className="relative mb-6 rounded-xl border bg-card overflow-hidden">
        <div className={`absolute left-0 top-0 h-full w-1.5 ${bar}`} />
        <div className="pl-6 pr-4 py-5 flex flex-wrap items-start gap-4 justify-between">
          <div>
            <Badge className={`mb-2 border-0 text-xs font-semibold ${badge}`}>
              {unit.code}
            </Badge>
            <h1 className="text-xl font-semibold">{unit.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {unit.semester.name} {unit.semester.year}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {weekTopics.length} week{weekTopics.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Brain className="h-4 w-4" />
                {totalConcepts} concept{totalConcepts !== 1 ? "s" : ""}
              </span>
            </div>
            <EditUnitDialog
              unitId={unit.id}
              initialCode={unit.code}
              initialName={unit.name}
              initialColor={unit.color}
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Week Topics
        </h2>
        <AddWeekTopicDialog unitId={id} nextWeekNumber={nextWeekNumber} />
      </div>

      {/* Week topic list */}
      {weekTopics.length > 0 ? (
        <div className="space-y-3">
          {weekTopics.map((topic, i) => (
            <WeekTopicCard
              key={topic.id}
              id={topic.id}
              weekNumber={topic.weekNumber}
              title={topic.title}
              objectives={topic.objectives}
              concepts={topic.concepts}
              unitId={id}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-medium">No weeks added yet</h3>
          <p className="mb-5 text-sm text-muted-foreground">
            Add your first week topic to start organising content and concepts.
          </p>
          <AddWeekTopicDialog unitId={id} nextWeekNumber={1} />
        </div>
      )}
    </div>
  )
}
