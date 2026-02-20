import { AppShell } from "@/components/app-shell"

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
