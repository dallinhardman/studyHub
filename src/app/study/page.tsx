import { Brain } from "lucide-react"
import { getDueConcepts } from "@/app/study/actions"
import { ReviewFlow } from "@/components/study/review-flow"

const MOCK_USER_ID = "mock-user-1"

export default async function StudyPage() {
  const dueConcepts = await getDueConcepts(MOCK_USER_ID)

  return (
    <div className="px-8 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Study</h1>
        <p className="text-sm text-muted-foreground">
          Review due concepts using spaced repetition (SM-2)
        </p>
      </div>

      {dueConcepts.length > 0 ? (
        <ReviewFlow concepts={dueConcepts} userId={MOCK_USER_ID} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Brain className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-medium">No concepts due</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        All caught up! Add concepts to your units and they&apos;ll appear here when
        they&apos;re due for review.
      </p>
    </div>
  )
}
