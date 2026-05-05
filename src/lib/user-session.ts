import { prisma } from "@/lib/prisma";

export async function resolveUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {},
    create: { email: normalizedEmail }
  });
}
