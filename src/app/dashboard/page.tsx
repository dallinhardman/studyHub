import { Suspense } from "react"
import { BookOpen } from "lucide-react"
import { getSemesters, getUnits } from "@/app/dashboard/actions"
import { AddUnitDialog } from "@/components/dashboard/add-unit-dialog"
import { SemesterSelector } from "@/components/dashboard/semester-selector"
import { UnitCard } from "@/components/dashboard/unit-card"

const MOCK_USER_ID = "mock-user-1"

interface PageProps {
  searchParams: Promise<{ semester?: string; show?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const semesters = await getSemesters(MOCK_USER_ID)

  const activeSemesterId = params.semester ?? semesters[0]?.id ?? ""
  const showArchived = params.show === "archived"

  const allUnits = activeSemesterId ? await getUnits(activeSemesterId) : []
  const units = allUnits.filter((u) => u.isArchived === showArchived)
  const archivedCount = allUnits.filter((u) => u.isArchived).length

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const activeSemester = semesters.find((s) => s.id === activeSemesterId)

  return (
    <div className="px-8 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, Alex
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-AU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <SemesterSelector
              semesters={semesters}
              currentId={activeSemesterId}
            />
          </Suspense>

          {archivedCount > 0 && (
            <a
              href={
                showArchived
                  ? `/dashboard?semester=${activeSemesterId}`
                  : `/dashboard?semester=${activeSemesterId}&show=archived`
              }
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {showArchived ? "← Active units" : `Archived (${archivedCount})`}
            </a>
          )}
        </div>

        <AddUnitDialog
          semesters={semesters}
          currentSemesterId={activeSemesterId}
          userId={MOCK_USER_ID}
        />
      </div>

      {/* Unit grid */}
      {units.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              id={unit.id}
              code={unit.code}
              name={unit.name}
              color={unit.color}
              isArchived={unit.isArchived}
              topicCount={unit._count.weekTopics}
              quizCount={unit._count.quizzes}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          hasSemester={!!activeSemesterId}
          showArchived={showArchived}
          activeSemester={activeSemester}
          userId={MOCK_USER_ID}
          semesters={semesters}
          activeSemesterId={activeSemesterId}
        />
      )}
    </div>
  )
}

function EmptyState({
  hasSemester,
  showArchived,
  activeSemester,
  userId,
  semesters,
  activeSemesterId,
}: {
  hasSemester: boolean
  showArchived: boolean
  activeSemester?: { name: string; year: number }
  userId: string
  semesters: { id: string; name: string; year: number }[]
  activeSemesterId: string
}) {
  if (showArchived) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">No archived units</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-medium">
        {hasSemester && activeSemester
          ? `No units in ${activeSemester.name} ${activeSemester.year}`
          : "No semesters yet"}
      </h3>
      <p className="mb-5 text-sm text-muted-foreground">
        Add your first unit to get started.
      </p>
      <AddUnitDialog
        semesters={semesters}
        currentSemesterId={activeSemesterId}
        userId={userId}
      />
    </div>
  )
}
