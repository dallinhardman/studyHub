import { AppSidebar } from "@/components/sidebar"
import { getDueCount } from "@/app/study/actions"

const MOCK_USER_ID = "mock-user-1"

export async function AppShell({ children }: { children: React.ReactNode }) {
  let dueCount = 0
  try {
    dueCount = await getDueCount(MOCK_USER_ID)
  } catch {
    // DB may not exist yet on fresh clone — show 0
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar dueCount={dueCount} />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  )
}
