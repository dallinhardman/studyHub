"use client"

import { useEffect, useState } from "react"

interface DueBadgeProps {
  initialCount: number
}

export function DueBadge({ initialCount }: DueBadgeProps) {
  const [count] = useState(initialCount)

  if (count <= 0) return null

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  )
}
