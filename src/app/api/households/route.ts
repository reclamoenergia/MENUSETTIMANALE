import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { resolveUserByEmail } from "@/lib/user-session";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1), email: z.string().email() });

export async function GET() {
  const households = await prisma.household.findMany({
    include: { persons: true },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json({ households });
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const user = await resolveUserByEmail(parsed.data.email);

  const household = await prisma.household.create({
    data: {
      name: parsed.data.name,
      userId: user.id
    }
  });
  return NextResponse.json(household, { status: 201 });
}
