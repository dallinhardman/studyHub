"use client"

import { useRef, useState, useTransition } from "react"
import { CloudUpload, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadContent } from "@/app/content/actions"
import type { ContentType } from "@/types"

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "LECTURE", label: "Lecture" },
  { value: "TUTORIAL", label: "Tutorial" },
  { value: "READING", label: "Reading" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "OTHER", label: "Other" },
]

interface UploadZoneProps {
  weekTopics: { id: string; label: string }[]
}

export function UploadZone({ weekTopics }: UploadZoneProps) {
  const [open, setOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<ContentType>("LECTURE")
  const [weekTopicId, setWeekTopicId] = useState(weekTopics[0]?.id ?? "")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""))
    setError(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleSubmit() {
    if (!file) { setError("Please select a file"); return }
    if (!weekTopicId) { setError("Please select a week topic"); return }

    startTransition(async () => {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("title", title)
      fd.append("type", type)
      fd.append("weekTopicId", weekTopicId)

      const res = await uploadContent(fd)
      if (res.success) {
        setOpen(false)
        setFile(null)
        setTitle("")
        setType("LECTURE")
        setError(null)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <CloudUpload className="h-4 w-4" />
          Upload File
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            {file ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate max-w-[220px]">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setTitle("") }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <CloudUpload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop or <span className="text-primary font-medium">browse</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  PDF, DOCX, PPTX, images, video
                </p>
              </>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="content-title">Title</Label>
            <Input
              id="content-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 3 Lecture Slides"
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ContentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>
                    {ct.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Week topic */}
          <div className="space-y-1.5">
            <Label>Week / Topic</Label>
            <Select value={weekTopicId} onValueChange={setWeekTopicId}>
              <SelectTrigger>
                <SelectValue placeholder="Select week…" />
              </SelectTrigger>
              <SelectContent>
                {weekTopics.map((wt) => (
                  <SelectItem key={wt.id} value={wt.id}>
                    {wt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isPending || !file}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
