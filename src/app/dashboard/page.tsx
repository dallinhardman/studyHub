/**
 * Dashboard – placeholder page.
 * Full implementation in the next phase: unit cards, SRS queue, quick actions.
 */

import { BookOpen, Brain, CalendarDays, FolderOpen } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Unit Management",
    description: "Add, organise, and archive your university units by semester.",
    status: "Coming soon",
  },
  {
    icon: FolderOpen,
    title: "Content Storage",
    description: "Drag-and-drop lecture files with Google Drive sync.",
    status: "Coming soon",
  },
  {
    icon: Brain,
    title: "AI Learning",
    description: "Summarise PDFs and auto-generate MCQs with Gemini / Claude.",
    status: "Coming soon",
  },
  {
    icon: CalendarDays,
    title: "Spaced Repetition",
    description: "SM-2 review scheduler with Google Calendar integration.",
    status: "Coming soon",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">
            Welcome to StudyHub
          </h1>
          <p className="mt-2 text-neutral-500">
            Your centralised study platform — units, content, AI summaries, and
            spaced repetition in one place.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, description, status }) => (
            <div
              key={title}
              className="bg-white rounded-xl border border-neutral-200 p-6 flex gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-800">{title}</h2>
                <p className="mt-1 text-sm text-neutral-500">{description}</p>
                <span className="mt-3 inline-block text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tech stack badge */}
        <p className="mt-10 text-xs text-neutral-400 text-center">
          Next.js 16 · Tailwind CSS v4 · Prisma 7 / SQLite · Shadcn/UI · SM-2 SRS
        </p>
      </div>
    </main>
  );
}
