import { generateGroceryList } from "@/lib/grocery-list";
import { generateWeeklyMenu } from "@/lib/menu-generation";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ householdId: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const persons = await prisma.person.findMany({ where: { householdId: parsed.data.householdId } });
  const recipes = await prisma.recipe.findMany({ include: { ingredients: { include: { ingredient: true } } } });

  if (persons.length === 0) {
    return NextResponse.json({ error: "No people found for this household." }, { status: 400 });
  }

  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((now.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);

  const menu = generateWeeklyMenu({ persons, recipes, weekNumber, allowFrozenFood: false });
  const groceryList = generateGroceryList({ weeklyMenu: menu.meals, recipes });

  return NextResponse.json({ ...menu, groceryList });
}
