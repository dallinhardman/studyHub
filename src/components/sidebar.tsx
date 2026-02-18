"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Brain,
  CalendarDays,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/units", label: "Units", icon: BookOpen },
  { href: "/study", label: "Study (SRS)", icon: Brain },
  { href: "/quizzes", label: "Quizzes", icon: GraduationCap },
  { href: "/content", label: "Content", icon: FolderOpen },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AB"

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Brain className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sidebar-foreground">StudyHub</span>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator />

      {/* User */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {user?.name ?? "Student"}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/60">
            {user?.university ?? "University"}
          </p>
        </div>
      </div>
    </aside>
  )
}
