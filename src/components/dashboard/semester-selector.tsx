"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Semester {
  id: string
  name: string
  year: number
}

interface SemesterSelectorProps {
  semesters: Semester[]
  currentId: string
}

export function SemesterSelector({ semesters, currentId }: SemesterSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("semester", id)
    router.push(`/dashboard?${params.toString()}`)
  }

  if (semesters.length === 0) return null

  return (
    <Select value={currentId} onValueChange={handleChange}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select semester" />
      </SelectTrigger>
      <SelectContent>
        {semesters.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name} ({s.year})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
