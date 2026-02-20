import { FolderOpen } from "lucide-react"
import { getContentByUser, getWeekTopicsForUser } from "@/app/content/actions"
import { ContentList } from "@/components/content/content-list"
import { UploadZone } from "@/components/content/upload-zone"

const MOCK_USER_ID = "mock-user-1"

export default async function ContentPage() {
  const [units, weekTopics] = await Promise.all([
    getContentByUser(MOCK_USER_ID),
    getWeekTopicsForUser(MOCK_USER_ID),
  ])

  const totalFiles = units.reduce(
    (s, u) => s + u.weeks.reduce((ws, w) => ws + w.items.length, 0),
    0
  )

  return (
    <div className="px-8 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
          <p className="text-sm text-muted-foreground">
            {totalFiles > 0
              ? `${totalFiles} file${totalFiles !== 1 ? "s" : ""} across ${units.length} unit${units.length !== 1 ? "s" : ""}`
              : "Upload lecture slides, notes, and readings"}
          </p>
        </div>
        {weekTopics.length > 0 && <UploadZone weekTopics={weekTopics} />}
      </div>

      {units.length > 0 ? (
        <ContentList units={units} />
      ) : (
        <EmptyState hasTopics={weekTopics.length > 0} weekTopics={weekTopics} />
      )}
    </div>
  )
}

function EmptyState({
  hasTopics,
  weekTopics,
}: {
  hasTopics: boolean
  weekTopics: { id: string; label: string }[]
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FolderOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-medium">No content yet</h3>
      {hasTopics ? (
        <>
          <p className="mb-4 text-sm text-muted-foreground max-w-xs">
            Upload lecture slides, readings, or any course material to organise
            them by week.
          </p>
          <UploadZone weekTopics={weekTopics} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground max-w-xs">
          Add week topics to your units first, then upload files here.
        </p>
      )}
    </div>
  )
}
