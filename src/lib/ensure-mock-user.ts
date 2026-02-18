import { prisma } from "@/lib/prisma"

/** Upserts the mock dev user so FK constraints don't fail. */
export async function ensureMockUser() {
  await prisma.user.upsert({
    where: { id: "mock-user-1" },
    update: {},
    create: {
      id: "mock-user-1",
      name: "Alex Brisbane",
      email: "alex@student.edu.au",
      timezone: "Australia/Brisbane",
    },
  })
}
