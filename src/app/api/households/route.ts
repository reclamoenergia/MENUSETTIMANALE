import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const user = await prisma.user.upsert({
    where: { email: "demo@local.dev" },
    update: {},
    create: {
      email: "demo@local.dev",
      name: "Demo User"
    }
  });

  const household = await prisma.household.create({
    data: {
      name: parsed.data.name,
      userId: user.id
    }
  });
  return NextResponse.json(household, { status: 201 });
}
