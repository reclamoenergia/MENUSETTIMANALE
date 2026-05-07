import { MainFoodGroup, Prisma } from "@prisma/client";

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: { ingredients: { include: { ingredient: true } } } }>;

export function isCerealLike(recipe: RecipeWithIngredients) {
  return recipe.mainFoodGroup === "cereals";
}

export function scoreRecipe(recipe: RecipeWithIngredients, o: { targetMainFoodGroup: MainFoodGroup; mealType: "lunch" | "dinner"; hasChildren: boolean; preferredIngredientIds: Set<string>; preferredRecipeTags: Set<string>; usedRecipeIds: Set<string>; recentMainIngredientIds: string[]; recentFoodGroups: MainFoodGroup[]; weeklyGroupCount: Partial<Record<MainFoodGroup, number>>; weeklyCerealCount: number }) {
  let score = 0;
  if (recipe.mainFoodGroup === o.targetMainFoodGroup) score += 30;
  if (o.preferredRecipeTags.size > 0) score += recipe.recipeTags.filter((t) => o.preferredRecipeTags.has(t)).length * 8;
  score += recipe.ingredients.filter((i) => o.preferredIngredientIds.has(i.ingredientId)).length * 6;
  if (o.hasChildren && recipe.suitableForChildren) score += 10;
  score -= Math.round(recipe.prepTimeMinutes / 10);
  if (o.usedRecipeIds.has(recipe.id)) score -= 100;
  if (o.recentFoodGroups.includes(recipe.mainFoodGroup)) score -= 14;
  if (o.recentMainIngredientIds.includes(recipe.ingredients[0]?.ingredientId ?? "")) score -= 28;
  if (o.mealType === "dinner" && isCerealLike(recipe)) score -= 250;
  if (isCerealLike(recipe) && o.weeklyCerealCount >= 3) score -= 180;
  return score;
}
