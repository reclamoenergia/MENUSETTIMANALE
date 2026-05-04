import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  householdId: z.string().min(1), name: z.string().min(1), age: z.number().int().min(0), sex: z.enum(["male", "female"]),
  heightCm: z.number().positive(), weightKg: z.number().positive(),
  activityLevel: z.enum(["sedentary", "lightly_active", "active", "very_active"]),
  goal: z.enum(["maintenance", "light_weight_loss", "muscle_gain", "sport_energy"]),
  excludedFoodIds: z.array(z.string()).default([]), preferredFoodIds: z.array(z.string()).default([]),
  defaultManagedMeals: z.array(z.enum(["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner", "evening_snack"]))
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const person = await prisma.person.create({ data: parsed.data });
  return NextResponse.json(person, { status: 201 });
}
