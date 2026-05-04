import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  householdId: z.string(),
  weekStartDate: z.string().datetime(),
  breakfastSnackMode: z.enum(["simple_suggestions", "recipes"]),
  allowFrozenFood: z.boolean(),
  lunchStructure: z.enum(["single_dish_plus_side", "first_second_plus_side"]),
  dinnerStructure: z.enum(["single_dish_plus_side", "first_second_plus_side"]),
  weeklyFoodGroupRules: z.record(z.object({ min: z.number(), max: z.number() })),
  daySettings: z.array(z.any())
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = await prisma.weeklySettings.create({ data: { ...parsed.data, weekStartDate: new Date(parsed.data.weekStartDate) } });
  return NextResponse.json(settings, { status: 201 });
}
