import { generateGroceryList } from "@/lib/menu-generation/groceryListGenerator";
import { generateWeeklyMenu } from "@/lib/menu-generation";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  householdId: z.string().min(1),
  breakfastSnackMode: z.enum(["simple_suggestions", "recipes"]).optional(),
  forbiddenFoodIds: z.array(z.string()).optional(),
  preferredFoodIds: z.array(z.string()).optional(),
  presence: z.record(z.boolean()).optional(),
  sportDays: z.record(z.boolean()).optional(),
  weeklyBalanceSlots: z.array(z.object({ dayKey: z.string(), mealType: z.enum(["lunch","dinner"]), mainFoodGroup: z.enum(["cereals","legumes","fish","white_meat","red_meat","eggs","cheese","vegetarian"]) })).optional(),
  preferredBreakfastByPersonId: z.record(z.string()).optional(),
  nutritionalTargets: z.record(z.object({ dailyCalories: z.number().positive(), proteinG: z.number().positive(), carbsG: z.number().positive(), fatG: z.number().positive() })).optional()
});

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

  const menu = generateWeeklyMenu({
    persons,
    recipes,
    weekNumber,
    allowFrozenFood: false,
    breakfastSnackMode: parsed.data.breakfastSnackMode,
    forbiddenFoodIds: parsed.data.forbiddenFoodIds,
    preferredFoodIds: parsed.data.preferredFoodIds,
    presence: parsed.data.presence,
    sportDays: parsed.data.sportDays,
    weeklyBalanceSlots: parsed.data.weeklyBalanceSlots,
    preferredBreakfastByPersonId: parsed.data.preferredBreakfastByPersonId,
    nutritionalTargets: parsed.data.nutritionalTargets
  });
  let groceryList;
  try {
    groceryList = generateGroceryList({ weeklyMenu: menu.meals, recipes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Grocery list generation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (groceryList.warnings.length > 0) {
    console.warn("Missing recipe ingredient data for grocery list:", groceryList.warnings.join(" | "));
  }

  const recipeOptions = recipes.map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    mealCategories: recipe.mealCategories,
    mainFoodGroup: recipe.mainFoodGroup,
    ingredients: recipe.ingredients.map((item) => ({
      ingredientId: item.ingredientId,
      ingredientName: item.ingredient.name,
      quantityPerStandardPortion: item.quantityPerStandardPortion,
      unit: item.unit,
      category: item.ingredient.category
    }))
  }));

  return NextResponse.json({ ...menu, groceryList, recipeOptions });
}
