# StudyHub – Project Conventions

A centralised study platform for a Brisbane-based university student.

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| Components | Shadcn/UI (new-york style) + Lucide React | latest |
| ORM | Prisma | 7.x |
| Database | SQLite (dev) → PostgreSQL (prod) | — |
| Auth | Mock `AuthContext` (→ replace with NextAuth/Clerk) | — |
| AI | Gemini / Claude API | — |
| Icons | Lucide React | — |

## Directory Structure

```
src/
├── app/               # Next.js App Router pages
│   ├── dashboard/     # Main dashboard
│   └── layout.tsx     # Root layout (includes AuthProvider)
├── components/
│   └── ui/            # Shadcn/UI components (add via `npx shadcn add <name>`)
├── hooks/             # Custom React hooks (e.g. useAuth, useSRS)
├── lib/
│   ├── prisma.ts      # Prisma Client singleton
│   ├── utils.ts       # cn() Tailwind utility
│   ├── auth-context.tsx  # Mock AuthProvider + useAuth
│   └── srs/
│       └── sm2.ts     # Pure SM-2 algorithm (no side effects)
├── types/
│   └── index.ts       # Domain types (ContentType, SRSState, etc.)
└── generated/
    └── prisma/        # Auto-generated Prisma Client (DO NOT EDIT)
```

## Key Conventions

### Imports
- Use `@/` alias for all internal imports (maps to `src/`)
- Prisma Client: import from `@/generated/prisma/client` (Prisma v7)
- cn utility: `import { cn } from "@/lib/utils"`

### Database
- Schema: `prisma/schema.prisma`
- After schema changes: `npx prisma db push && npx prisma generate`
- SQLite file: `prisma/dev.db` (gitignored)
- String fields replace enums (SQLite has no native enum support)
- Valid values documented as comments in schema

### SRS Algorithm
- Module: `src/lib/srs/sm2.ts` — pure function, no DB access
- SRS state lives on the `Concept` model, not `QuizQuestion`
- `calculateNextReview(state, grade)` returns new state; caller persists it
- Grades: 0 (blackout) → 5 (perfect)

### Auth
- `useAuth()` hook returns `{ user, isAuthenticated }`
- All pages using user data must be inside `<AuthProvider>` (root layout)
- Mock user: `{ id: "mock-user-1", name: "Alex Brisbane", ... }`

### Components
- Add Shadcn components: `npx shadcn add <component-name>`
- All UI primitives go in `src/components/ui/`
- Page-specific components go in `src/components/` (grouped by feature)

### Server Actions
- Place in `src/app/<feature>/actions.ts`
- Return `ActionResult<T>` type from `@/types`

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma studio    # Visual DB browser
npx prisma db push   # Sync schema → DB (no migration files)
npx prisma generate  # Re-generate Prisma Client after schema changes
```

## Progress

See `features.json` for feature completion status.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path (default: `file:./dev.db`) |
| `GEMINI_API_KEY` | Google Gemini API key (for AI features) |
| `ANTHROPIC_API_KEY` | Claude API key (alternative AI) |
| `GOOGLE_CLIENT_ID` | Google OAuth (Drive + Calendar) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
