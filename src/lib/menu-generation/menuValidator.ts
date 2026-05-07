import { MainFoodGroup, Prisma } from "@prisma/client";
import { filterRecipesHard, RecipeHardFilterOptions } from "@/lib/menu-generation/recipeFilter";

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: { ingredients: { include: { ingredient: true } } } }>;

export function validateAndSelectMeal(params:{recipes:RecipeWithIngredients[];hardFilterOptions:RecipeHardFilterOptions;state:{usedRecipeIds:Set<string>;recentIngredientIds:string[];recentFoodGroups:MainFoodGroup[];weeklyGroupCount:Partial<Record<MainFoodGroup,number>>;weeklyCerealCount:number};targetGroup:MainFoodGroup;scorer:(recipe:RecipeWithIngredients)=>number}) {
  const hard = filterRecipesHard(params.recipes, params.hardFilterOptions);
  const attempt = (pool: RecipeWithIngredients[]) => pool.map((r)=>({r,s:params.scorer(r)})).sort((a,b)=>b.s-a.s)[0]?.r;
  let recipe = attempt(hard);
  let warning: string | undefined;
  if (!recipe) recipe = attempt(params.recipes.filter((r)=>r.mealCategories.includes(params.hardFilterOptions.mealCategory)));
  if (!recipe) warning = "No compatible recipe found for this meal";
  if (recipe) {
    params.state.usedRecipeIds.add(recipe.id);
    params.state.recentFoodGroups.push(recipe.mainFoodGroup);
    params.state.recentIngredientIds.push(recipe.ingredients[0]?.ingredientId ?? "");
    while (params.state.recentFoodGroups.length > 4) params.state.recentFoodGroups.shift();
    while (params.state.recentIngredientIds.length > 4) params.state.recentIngredientIds.shift();
    params.state.weeklyGroupCount[recipe.mainFoodGroup] = (params.state.weeklyGroupCount[recipe.mainFoodGroup] ?? 0) + 1;
    if (recipe.mainFoodGroup === "cereals") params.state.weeklyCerealCount += 1;
  }
  return { recipe, warning };
}
