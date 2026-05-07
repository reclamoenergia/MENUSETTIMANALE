import { Prisma, RecipeMealCategory } from "@prisma/client";

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: { ingredients: { include: { ingredient: true } } } }>;

export type RecipeHardFilterOptions = { mealCategory: RecipeMealCategory; excludedFoodIds: string[]; maxPrepMinutes: number; mustBePreppableDayBefore: boolean; allowFrozenFood: boolean; weekNumber: number };

export function filterRecipesHard(recipes: RecipeWithIngredients[], options: RecipeHardFilterOptions) {
  return recipes.filter((recipe) => {
    if (!recipe.mealCategories.includes(options.mealCategory)) return false;
    if (recipe.prepTimeMinutes > options.maxPrepMinutes) return false;
    if (options.mustBePreppableDayBefore && !recipe.canBePreparedDayBefore) return false;
    for (const i of recipe.ingredients) {
      if (options.excludedFoodIds.includes(i.ingredientId)) return false;
      if (i.ingredient.isSeasonal && !i.ingredient.seasonWeeks.includes(options.weekNumber)) return false;
      if (!options.allowFrozenFood && i.ingredient.storageType === "freezer" && !i.ingredient.hasFrozenOption) return false;
    }
    return true;
  });
}
