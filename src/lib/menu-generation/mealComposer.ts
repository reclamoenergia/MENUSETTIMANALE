import { Prisma } from "@prisma/client";

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: { ingredients: { include: { ingredient: true } } } }>;
export type ComposedMealRecipe = { recipes: RecipeWithIngredients[] };

export function composeMealRecipes(params: { main?: RecipeWithIngredients; sideDishes: RecipeWithIngredients[]; dayIndex: number; weekNumber: number }): ComposedMealRecipe {
  const main = params.main ? [params.main] : [];
  const validSides = params.sideDishes.filter((s) => s.ingredients.some((i) => i.ingredient.category === "vegetables" && i.quantityPerStandardPortion > 0 && (!i.ingredient.isSeasonal || i.ingredient.seasonWeeks.includes(params.weekNumber))));
  const side = validSides[params.dayIndex % Math.max(1, validSides.length)];
  return { recipes: [...main, ...(side ? [side] : [])] };
}
