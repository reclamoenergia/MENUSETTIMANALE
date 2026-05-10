import { ActivityLevel, Goal, MainFoodGroup, MealType, Person, Prisma, RecipeMealCategory, Sex } from "@prisma/client";
import { buildBalancePlan, type WeeklyFoodGroupRules } from "@/lib/menu-generation/balancePlanner";
import { filterRecipesHard } from "@/lib/menu-generation/recipeFilter";
import { scoreRecipe } from "@/lib/menu-generation/recipeScorer";
import { composeMealRecipes, type ComposedMealRecipe } from "@/lib/menu-generation/mealComposer";
import { buildPortions, buildSimpleSuggestionPortions, estimateDailyCalories, estimateMacroTargets } from "@/lib/menu-generation/portionCalculator";
import { validateAndSelectMeal } from "@/lib/menu-generation/menuValidator";

const mealDistribution: Record<MealType, number> = {
  breakfast: 0.2,
  morning_snack: 0.1,
  lunch: 0.35,
  afternoon_snack: 0.1,
  dinner: 0.25,
  evening_snack: 0
};

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: { ingredients: { include: { ingredient: true } } } }>;

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const snackSuggestionPool = {
  breakfast: ["Yogurt + {fruit}", "Milk + whole-grain bread", "Ricotta + bread + {fruit}"],
  morning_snack: ["{fruit}", "Yogurt + {fruit}", "Bread + ricotta + {fruit}"],
  afternoon_snack: ["{fruit} + nuts", "Yogurt + {fruit}", "Bread + olive oil + tomato"]
} as const;
const seasonalFruitCatalog: { name: string; seasonWeeks: number[] }[] = [
  { name: "apple", seasonWeeks: [1,2,3,4,5,6,7,8,9,10,40,41,42,43,44,45,46,47,48,49,50,51,52] },
  { name: "banana", seasonWeeks: Array.from({ length: 52 }, (_, i) => i + 1) },
  { name: "pear", seasonWeeks: [1,2,3,4,5,6,7,8,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52] },
  { name: "peach", seasonWeeks: [23,24,25,26,27,28,29,30,31,32,33,34,35] }
];
const pickSeasonalFruit = (weekNumber: number, dayIndex: number) => {
  const seasonal = seasonalFruitCatalog.filter((fruit) => fruit.seasonWeeks.includes(weekNumber));
  const pool = seasonal.length > 0 ? seasonal : seasonalFruitCatalog.filter((item) => item.name === "apple" || item.name === "banana");
  return pool[dayIndex % pool.length]?.name ?? "banana";
};

type WeeklyBalanceSlot = { dayKey: string; mealType: "lunch" | "dinner"; mainFoodGroup: MainFoodGroup };

const FIXED_BREAKFASTS = new Set(["yogurt greco 150 g con 4 biscotti","latte e biscotti","latte e cereali","pancake semplici con frutta"]);
const FIXED_MORNING_SNACKS = new Set(["panino con il prosciutto","panino con il pomodoro","banana","taralli","carote","merendina","biscotti ringo"]);
const FIXED_AFTERNOON_SNACKS = new Set(["latte e cereali","fagottini di bresaola con fiocchi di latte","pancake con frutta","merendina","banana"]);

export { estimateDailyCalories, estimateMacroTargets, WeeklyFoodGroupRules };

export function generateWeeklyMenu(params: {
  persons: Person[];
  recipes: RecipeWithIngredients[];
  weekNumber: number;
  allowFrozenFood: boolean;
  planningDays?: number;
  weeklyFoodGroupRules?: WeeklyFoodGroupRules;
  preferredRecipeTags?: string[];
  breakfastSnackMode?: "simple_suggestions" | "recipes";
  requireDayBeforePrepForLunch?: boolean;
  forbiddenFoodIds?: string[];
  preferredFoodIds?: string[];
  presence?: Record<string, boolean>;
  sportDays?: Record<string, boolean>;
  weeklyBalanceSlots?: WeeklyBalanceSlot[];
  preferredBreakfastByPersonId?: Record<string, string>;
}) {
  const planningDays = params.planningDays ?? 7;
  const excludedFoodIds = [...new Set([...params.persons.flatMap((p) => p.excludedFoodIds), ...(params.forbiddenFoodIds ?? [])])];
  const preferredIngredientIds = new Set([...params.persons.flatMap((p) => p.preferredFoodIds), ...(params.preferredFoodIds ?? [])]);
  const preferredRecipeTags = new Set(params.preferredRecipeTags ?? []);
  const hasChildren = params.persons.some((p) => p.age < 18);

  const sideDishes = filterRecipesHard(params.recipes, { mealCategory: "side_dish", excludedFoodIds, maxPrepMinutes: 30, mustBePreppableDayBefore: false, allowFrozenFood: params.allowFrozenFood, weekNumber: params.weekNumber });
  const breakfastRecipes = filterRecipesHard(params.recipes, { mealCategory: "breakfast", excludedFoodIds, maxPrepMinutes: 20, mustBePreppableDayBefore: false, allowFrozenFood: params.allowFrozenFood, weekNumber: params.weekNumber }).filter((r) => FIXED_BREAKFASTS.has(r.name.toLowerCase()));
  const morningSnackRecipes = filterRecipesHard(params.recipes, { mealCategory: "morning_snack", excludedFoodIds, maxPrepMinutes: 15, mustBePreppableDayBefore: false, allowFrozenFood: params.allowFrozenFood, weekNumber: params.weekNumber }).filter((r) => FIXED_MORNING_SNACKS.has(r.name.toLowerCase()));
  const afternoonSnackRecipes = filterRecipesHard(params.recipes, { mealCategory: "afternoon_snack", excludedFoodIds, maxPrepMinutes: 15, mustBePreppableDayBefore: false, allowFrozenFood: params.allowFrozenFood, weekNumber: params.weekNumber }).filter((r) => FIXED_AFTERNOON_SNACKS.has(r.name.toLowerCase()));

  const userSlotMap = new Map((params.weeklyBalanceSlots ?? []).map((s) => [`${s.dayKey}:${s.mealType}`, s.mainFoodGroup]));
  const balancePlan = buildBalancePlan({ planningDays, weeklyFoodGroupRules: params.weeklyFoodGroupRules, userSlotMap });

  const state = { usedRecipeIds: new Set<string>(), recentIngredientIds: [] as string[], recentFoodGroups: [] as MainFoodGroup[], weeklyGroupCount: {} as Partial<Record<MainFoodGroup, number>>, weeklyCerealCount: 0 };

  const isPresentAtMeal = (personId: string, mealType: MealType, dayIndex: number) => params.presence?.[`${mealType}:${dayKeys[dayIndex]}:${personId}`] ?? true;
  const isSportDay = (personId: string, dayIndex: number) => params.sportDays?.[`sport:${dayKeys[dayIndex]}:${personId}`] ?? false;

  const meals = Array.from({ length: planningDays }).map((_, dayIndex) => {
    const day = dayNames[dayIndex % 7];
    const targets = balancePlan[dayIndex];
    const composed: { mealType: MealType; recipes: string[]; portions: ReturnType<typeof buildPortions>; warning?: string }[] = [];

    for (const mealType of ["lunch", "dinner"] as const) {
      const selection = validateAndSelectMeal({
        recipes: params.recipes,
        hardFilterOptions: { mealCategory: mealType, excludedFoodIds, maxPrepMinutes: 45, mustBePreppableDayBefore: mealType === "lunch" && (params.requireDayBeforePrepForLunch ?? false), allowFrozenFood: params.allowFrozenFood, weekNumber: params.weekNumber },
        state,
        targetGroup: targets[mealType],
        scorer: (recipe) => scoreRecipe(recipe, { targetMainFoodGroup: targets[mealType], mealType, hasChildren, preferredIngredientIds, preferredRecipeTags, usedRecipeIds: state.usedRecipeIds, recentMainIngredientIds: state.recentIngredientIds, recentFoodGroups: state.recentFoodGroups, weeklyGroupCount: state.weeklyGroupCount, weeklyCerealCount: state.weeklyCerealCount })
      });

      const composedMeal: ComposedMealRecipe = composeMealRecipes({ main: selection.recipe, sideDishes, dayIndex, weekNumber: params.weekNumber });
      const portions = buildPortions({ mealType, selectedRecipes: composedMeal.recipes, persons: params.persons, dayIndex, isPresentAtMeal, isSportDay, mealDistribution });
      composed.push({ mealType, recipes: composedMeal.recipes.map((r) => r.name), portions, warning: selection.warning });
    }

    if (params.persons.some((p) => p.defaultManagedMeals.includes("breakfast"))) {
      const fallbackBreakfast = breakfastRecipes[0];
      if (fallbackBreakfast) {
        const breakfastByPerson = params.persons
          .filter((p) => p.defaultManagedMeals.includes("breakfast"))
          .map((person) => {
            const preferred = breakfastRecipes.find((recipe) => recipe.name === params.preferredBreakfastByPersonId?.[person.id]);
            return { person, recipe: preferred ?? fallbackBreakfast };
          });
        const uniqueRecipes = Array.from(new Set(breakfastByPerson.map((item) => item.recipe.name)));
        const portions = breakfastByPerson.map(({ person, recipe }) => ({ ...buildPortions({ mealType: "breakfast", selectedRecipes: [recipe], persons: [person], dayIndex, isPresentAtMeal, isSportDay, mealDistribution })[0], assignedRecipeName: recipe.name }));
        composed.unshift({ mealType: "breakfast", recipes: uniqueRecipes, portions });
      }
    }
    if (params.persons.some((p) => p.defaultManagedMeals.includes("morning_snack")) && morningSnackRecipes.length > 0) {
      const recipe1 = morningSnackRecipes[dayIndex % morningSnackRecipes.length];
      const recipe2 = morningSnackRecipes[(dayIndex + 2) % morningSnackRecipes.length];
      composed.push({
        mealType: "morning_snack",
        recipes: [recipe1.name],
        portions: buildPortions({ mealType: "morning_snack", selectedRecipes: [recipe1], persons: params.persons, dayIndex, isPresentAtMeal, isSportDay, mealDistribution }).map((portion) => ({ ...portion, assignedRecipeName: recipe1.name }))
      } as { mealType: MealType; recipes: string[]; portions: ReturnType<typeof buildPortions>; warning?: string });
      composed.push({
        mealType: "morning_snack",
        recipes: [recipe2.name],
        portions: buildPortions({ mealType: "morning_snack", selectedRecipes: [recipe2], persons: params.persons, dayIndex, isPresentAtMeal: (personId, _mealType, idx) => params.presence?.[`morning_snack_2:${dayKeys[idx]}:${personId}`] ?? isPresentAtMeal(personId, "morning_snack", idx), isSportDay, mealDistribution }).map((portion) => ({ ...portion, assignedRecipeName: recipe2.name, snackSlot: "morning_snack_2" }))
      } as { mealType: MealType; recipes: string[]; portions: ReturnType<typeof buildPortions>; warning?: string });
    }

    if (params.persons.some((p) => p.defaultManagedMeals.includes("afternoon_snack")) && afternoonSnackRecipes.length > 0) {
      const recipe = afternoonSnackRecipes[dayIndex % afternoonSnackRecipes.length];
      composed.push({ mealType: "afternoon_snack", recipes: [recipe.name], portions: buildPortions({ mealType: "afternoon_snack", selectedRecipes: [recipe], persons: params.persons, dayIndex, isPresentAtMeal, isSportDay, mealDistribution }) });
    }

    return { day, meals: composed };
  });

  return { disclaimer: "Indicative estimate only. This menu is not medical advice and does not replace a nutrition professional.", meals, balancePlanVisible: balancePlan };
}
