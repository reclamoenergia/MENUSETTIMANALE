import { ActivityLevel, Goal, MainFoodGroup, MealType, Person, Prisma, RecipeMealCategory, Sex } from "@prisma/client";

const activityFactors: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  active: 1.55,
  very_active: 1.725
};

const goalAdjustments: Record<Goal, number> = {
  maintenance: 1,
  light_weight_loss: 0.9,
  muscle_gain: 1.1,
  sport_energy: 1.05
};

const macroTargetPercentages: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  maintenance: { protein: 0.2, carbs: 0.5, fat: 0.3 },
  light_weight_loss: { protein: 0.25, carbs: 0.4, fat: 0.3 },
  muscle_gain: { protein: 0.28, carbs: 0.45, fat: 0.27 },
  sport_energy: { protein: 0.22, carbs: 0.55, fat: 0.23 }
};

const mealDistribution: Record<MealType, number> = {
  breakfast: 0.2,
  morning_snack: 0.1,
  lunch: 0.35,
  afternoon_snack: 0.1,
  dinner: 0.25,
  evening_snack: 0
};

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: { ingredients: { include: { ingredient: true } } } }>;

type FoodGroupRule = {
  min?: number;
  max?: number;
};

type WeeklyFoodGroupRules = Partial<Record<MainFoodGroup, FoodGroupRule>>;

type MealFoodGroupSlot = {
  dayIndex: number;
  mealType: Extract<MealType, "lunch" | "dinner">;
  mainFoodGroup: MainFoodGroup;
};

const snackSuggestionPool = {
  breakfast: ["Yogurt + seasonal fruit", "Milk + whole-grain bread", "Ricotta + bread + fruit"],
  afternoon_snack: ["Seasonal fruit + nuts", "Yogurt + fruit", "Bread + olive oil + tomato"],
  morning_snack: ["Seasonal fruit", "Yogurt cup", "Whole-grain crackers"]
} as const;

const lunchDinnerMealTypes: Array<Extract<MealType, "lunch" | "dinner">> = ["lunch", "dinner"];
const preferredNonCerealGroups = new Set<MainFoodGroup>(["legumes", "fish", "eggs", "cheese", "vegetarian", "white_meat"]);
const weeklyPastaLimit = 3;

export function estimateDailyCalories(person: Person): number {
  const baseBmr =
    10 * person.weightKg +
    6.25 * person.heightCm -
    5 * person.age +
    (person.sex === Sex.male ? 5 : -161);

  let adjustedBmr = baseBmr;

  // Heuristic adjustment for children to keep results realistic without a complex pediatric model.
  if (person.age < 18) {
    adjustedBmr *= 0.82;
  }

  const estimated = adjustedBmr * activityFactors[person.activityLevel] * goalAdjustments[person.goal];
  const minimum = person.age < 12 ? 900 : person.age < 18 ? 1200 : 1400;

  return Math.max(minimum, estimated);
}

export function estimateMacroTargets(person: Person) {
  const calories = estimateDailyCalories(person);
  const macroSplit = macroTargetPercentages[person.goal];

  return {
    calories,
    proteinGrams: (calories * macroSplit.protein) / 4,
    carbsGrams: (calories * macroSplit.carbs) / 4,
    fatGrams: (calories * macroSplit.fat) / 9
  };
}

function filterRecipes(
  recipes: RecipeWithIngredients[],
  options: {
    mealCategory: RecipeMealCategory;
    excludedFoodIds: string[];
    maxPrepMinutes: number;
    mustBePreppableDayBefore: boolean;
    allowFrozenFood: boolean;
    weekNumber: number;
  }
) {
  return recipes.filter((recipe) => {
    if (!recipe.mealCategories.includes(options.mealCategory)) return false;
    if (recipe.prepTimeMinutes > options.maxPrepMinutes) return false;
    if (options.mustBePreppableDayBefore && !recipe.canBePreparedDayBefore) return false;

    for (const item of recipe.ingredients) {
      if (options.excludedFoodIds.includes(item.ingredientId)) {
        return false;
      }

      if (item.ingredient.isSeasonal && !item.ingredient.seasonWeeks.includes(options.weekNumber)) {
        return false;
      }

      if (!options.allowFrozenFood && item.ingredient.storageType === "freezer" && !item.ingredient.hasFrozenOption) {
        return false;
      }
    }

    return true;
  });
}

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

const rotationFoodGroups: MainFoodGroup[] = ["legumes", "fish", "eggs", "cheese", "vegetarian", "white_meat", "cereals"];

export function generateMealFoodGroupPlan(params: {
  planningDays: number;
  weeklyFoodGroupRules?: WeeklyFoodGroupRules;
}) {
  const planningDays = Math.max(1, Math.floor(params.planningDays));
  const rules = params.weeklyFoodGroupRules ?? {};
  const slots: MealFoodGroupSlot[] = [];
  const assignmentsCount: Partial<Record<MainFoodGroup, number>> = {};

  for (let dayIndex = 0; dayIndex < planningDays; dayIndex += 1) {
    for (const mealType of lunchDinnerMealTypes) {
      const group = chooseFoodGroupForSlot({
        mealType,
        dayIndex,
        slotIndex: slots.length,
        rules,
        assignmentsCount,
        previousGroup: slots.at(-1)?.mainFoodGroup
      });

      assignmentsCount[group] = (assignmentsCount[group] ?? 0) + 1;
      slots.push({ dayIndex, mealType, mainFoodGroup: group });
    }
  }

  return {
    planningDays,
    slots
  };
}

function chooseFoodGroupForSlot(params: {
  dayIndex: number;
  mealType: Extract<MealType, "lunch" | "dinner">;
  slotIndex: number;
  rules: WeeklyFoodGroupRules;
  assignmentsCount: Partial<Record<MainFoodGroup, number>>;
  previousGroup?: MainFoodGroup;
}): MainFoodGroup {
  const scoredGroups = rotationFoodGroups.map((group, index) => {
    const count = params.assignmentsCount[group] ?? 0;
    const min = params.rules[group]?.min ?? 0;
    const max = params.rules[group]?.max;
    let score = 0;

    if (group === params.previousGroup) score -= 1000;
    if (max !== undefined && count >= max) score -= 200;
    if (count < min) score += 80;
    if (group === "cereals") {
      score -= 30;
      if (count > 0) score -= count * 12;
    }

    const rotationTarget = rotationFoodGroups[(params.slotIndex + index) % rotationFoodGroups.length];
    if (group === rotationTarget) score += 10;
    score -= count * 8;

    return { group, score };
  });

  scoredGroups.sort((a, b) => b.score - a.score);
  return scoredGroups[0].group;
}

function getMainIngredientId(recipe: RecipeWithIngredients): string | null {
  return recipe.ingredients[0]?.ingredientId ?? null;
}

type RecipeHardFilterOptions = {
  mealCategory: RecipeMealCategory;
  excludedFoodIds: string[];
  maxPrepMinutes: number;
  mustBePreppableDayBefore: boolean;
  allowFrozenFood: boolean;
  weekNumber: number;
};

type RecipeSoftScoreOptions = {
  usedRecipeIds: Set<string>;
  recentMainIngredientIds: string[];
  recentFoodGroups: MainFoodGroup[];
  preferredIngredientIds: Set<string>;
  preferredRecipeTags: Set<string>;
  hasChildren: boolean;
  targetMainFoodGroup?: MainFoodGroup;
  recentPastaRecipeIds: string[];
  weeklyPastaCount: number;
};

function isPastaOrCerealRecipe(recipe: RecipeWithIngredients): boolean {
  const name = recipe.name.toLowerCase();
  if (recipe.mainFoodGroup !== "cereals") return false;
  return ["pasta", "riso", "risotto", "orzo", "farro", "cous cous", "gnocchi", "polenta"].some((token) => name.includes(token));
}

function applyRecipeHardFilters(recipes: RecipeWithIngredients[], options: RecipeHardFilterOptions) {
  return filterRecipes(recipes, options);
}

function scoreRecipeForMeal(recipe: RecipeWithIngredients, options: RecipeSoftScoreOptions): number {
  let score = 0;
  const mainIngredientId = getMainIngredientId(recipe);

  if (options.targetMainFoodGroup && recipe.mainFoodGroup === options.targetMainFoodGroup) score += 24;
  if (options.usedRecipeIds.has(recipe.id)) score -= 50;
  if (options.recentFoodGroups.includes(recipe.mainFoodGroup)) score -= 12;
  if (mainIngredientId && options.recentMainIngredientIds.includes(mainIngredientId)) score -= 30;

  const preferredIngredientMatches = recipe.ingredients.filter((item) => options.preferredIngredientIds.has(item.ingredientId)).length;
  score += preferredIngredientMatches * 9;

  const matchingPreferredTags = recipe.recipeTags.filter((tag) => options.preferredRecipeTags.has(tag)).length;
  score += matchingPreferredTags * 10;

  if (options.hasChildren && recipe.suitableForChildren) score += 14;
  if (options.hasChildren && !recipe.suitableForChildren) score -= 10;

  if (recipe.mainFoodGroup === "cereals") score -= 8;
  if (options.targetMainFoodGroup && preferredNonCerealGroups.has(options.targetMainFoodGroup) && recipe.mainFoodGroup === "cereals") {
    score -= 35;
  }
  if (isPastaOrCerealRecipe(recipe)) {
    if (options.weeklyPastaCount >= 2) score -= 55;
    if (options.weeklyPastaCount >= weeklyPastaLimit) score -= 500;
  }
  if (options.recentPastaRecipeIds.includes(recipe.id) && recipe.mainFoodGroup === "cereals") score -= 25;

  return score;
}

function chooseRecipeWithDiversity(
  candidates: RecipeWithIngredients[],
  options: RecipeSoftScoreOptions
): RecipeWithIngredients | undefined {
  const scored = candidates.map((recipe) => {
    return { recipe, score: scoreRecipeForMeal(recipe, options) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.recipe;
}

function selectMealRecipeWithFallback(params: {
  recipes: RecipeWithIngredients[];
  hardFilterOptions: RecipeHardFilterOptions;
  softScoreOptions: RecipeSoftScoreOptions;
  targetMainFoodGroup?: MainFoodGroup;
  allowPastaLimitFilter: boolean;
}) {
  const warnings: string[] = [];
  const pastaFilter = (recipe: RecipeWithIngredients) => {
    if (!params.allowPastaLimitFilter) return true;
    if (!isPastaOrCerealRecipe(recipe)) return true;
    return params.softScoreOptions.weeklyPastaCount < weeklyPastaLimit;
  };

  const baseCandidates = applyRecipeHardFilters(params.recipes, params.hardFilterOptions);
  const strictTargetCandidates = baseCandidates
    .filter((recipe) => !params.targetMainFoodGroup || recipe.mainFoodGroup === params.targetMainFoodGroup)
    .filter(pastaFilter);
  let selected = chooseRecipeWithDiversity(strictTargetCandidates, params.softScoreOptions);

  if (!selected) {
    const noTargetCandidates = baseCandidates.filter(pastaFilter);
    selected = chooseRecipeWithDiversity(noTargetCandidates, { ...params.softScoreOptions, targetMainFoodGroup: undefined });
  }

  if (!selected) {
    const relaxedCandidates = filterRecipes(params.recipes, params.hardFilterOptions);
    selected = chooseRecipeWithDiversity(relaxedCandidates, { ...params.softScoreOptions, targetMainFoodGroup: undefined });
  }

  if (!selected) {
    warnings.push("No compatible recipe found for this meal");
  }

  return { recipe: selected, warnings };
}

function getPortionLabel(multiplier: number): "Small" | "Medium" | "Large" {
  if (multiplier < 0.9) return "Small";
  if (multiplier > 1.2) return "Large";
  return "Medium";
}

type WeeklyBalanceSlot = { dayKey: string; mealType: "lunch" | "dinner"; mainFoodGroup: MainFoodGroup };

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
}) {
  const excludedFoodIds = [...new Set([...params.persons.flatMap((p) => p.excludedFoodIds), ...(params.forbiddenFoodIds ?? [])])];
  const usedRecipeIds = new Set<string>();
  const recentMainIngredientIds: string[] = [];
  const recentFoodGroups: MainFoodGroup[] = [];
  const recentPastaRecipeIds: string[] = [];
  let weeklyPastaCount = 0;
  const preferredIngredientIds = new Set([...params.persons.flatMap((p) => p.preferredFoodIds), ...(params.preferredFoodIds ?? [])]);
  const preferredRecipeTags = new Set(params.preferredRecipeTags ?? []);
  const hasChildren = params.persons.some((person) => person.age < 18);

  const breakfastSnackMode = params.breakfastSnackMode ?? "simple_suggestions";
  const shouldGenerateBreakfast = params.persons.some((person) => person.defaultManagedMeals.includes("breakfast"));
  const shouldGenerateAfternoonSnack = params.persons.some((person) => person.defaultManagedMeals.includes("afternoon_snack"));

  const sideDishes = filterRecipes(params.recipes, {
    mealCategory: "side_dish",
    excludedFoodIds,
    maxPrepMinutes: 30,
    mustBePreppableDayBefore: false,
    allowFrozenFood: params.allowFrozenFood,
    weekNumber: params.weekNumber
  });



  const breakfastRecipes = filterRecipes(params.recipes, {
    mealCategory: "breakfast",
    excludedFoodIds,
    maxPrepMinutes: 20,
    mustBePreppableDayBefore: false,
    allowFrozenFood: params.allowFrozenFood,
    weekNumber: params.weekNumber
  });

  const morningSnackRecipes = filterRecipes(params.recipes, {
    mealCategory: "morning_snack",
    excludedFoodIds,
    maxPrepMinutes: 15,
    mustBePreppableDayBefore: false,
    allowFrozenFood: params.allowFrozenFood,
    weekNumber: params.weekNumber
  });

  const afternoonSnackRecipes = filterRecipes(params.recipes, {
    mealCategory: "afternoon_snack",
    excludedFoodIds,
    maxPrepMinutes: 15,
    mustBePreppableDayBefore: false,
    allowFrozenFood: params.allowFrozenFood,
    weekNumber: params.weekNumber
  });


  const mealGroupBySlot = new Map<string, MainFoodGroup>();
  for (const slot of params.weeklyBalanceSlots ?? []) {
    mealGroupBySlot.set(`${slot.dayKey}:${slot.mealType}`, slot.mainFoodGroup);
  }

  const isPresentAtMeal = (personId: string, mealType: MealType, dayIndex: number): boolean => {
    const day = dayKeys[dayIndex % dayKeys.length];
    const key = `${mealType}:${day}:${personId}`;
    return params.presence?.[key] ?? true;
  };

  const isSportDay = (personId: string, dayIndex: number): boolean => {
    const day = dayKeys[dayIndex % dayKeys.length];
    return params.sportDays?.[`sport:${day}:${personId}`] ?? false;
  };

  const foodGroupPlan = generateMealFoodGroupPlan({
    planningDays: params.planningDays ?? dayNames.length,
    weeklyFoodGroupRules: params.weeklyFoodGroupRules
  });

  const meals = foodGroupPlan.slots
    .reduce<Record<number, { lunch?: MainFoodGroup; dinner?: MainFoodGroup }>>((acc, slot) => {
      const current = acc[slot.dayIndex] ?? {};
      const dayKey = dayKeys[slot.dayIndex % dayKeys.length];
      current[slot.mealType] = mealGroupBySlot.get(`${dayKey}:${slot.mealType}`) ?? slot.mainFoodGroup;
      acc[slot.dayIndex] = current;
      return acc;
    }, {})
    ;

  const dailyMeals = Object.entries(meals).map(([dayIndexRaw, targetGroups]) => {
    const dayIndex = Number(dayIndexRaw);
    const day = dayNames[dayIndex % dayNames.length];
    const lunchSelection = selectMealRecipeWithFallback({
      recipes: params.recipes,
      hardFilterOptions: {
      mealCategory: "lunch",
      excludedFoodIds,
      maxPrepMinutes: 45,
      mustBePreppableDayBefore: params.requireDayBeforePrepForLunch ?? false,
      allowFrozenFood: params.allowFrozenFood,
      weekNumber: params.weekNumber,
    },
      targetMainFoodGroup: targetGroups.lunch,
      softScoreOptions: {
        usedRecipeIds,
        recentMainIngredientIds,
        recentFoodGroups,
        preferredIngredientIds,
        preferredRecipeTags,
        hasChildren,
        targetMainFoodGroup: targetGroups.lunch,
        recentPastaRecipeIds,
        weeklyPastaCount
      },
      allowPastaLimitFilter: true
    });

    const lunch = lunchSelection.recipe;

    const dinnerSelection = selectMealRecipeWithFallback({
      recipes: params.recipes,
      hardFilterOptions: {
      mealCategory: "dinner",
      excludedFoodIds,
      maxPrepMinutes: 45,
      mustBePreppableDayBefore: false,
      allowFrozenFood: params.allowFrozenFood,
      weekNumber: params.weekNumber
    },
      targetMainFoodGroup: targetGroups.dinner,
      softScoreOptions: {
        usedRecipeIds,
        recentMainIngredientIds,
        recentFoodGroups,
        preferredIngredientIds,
        preferredRecipeTags,
        hasChildren,
        targetMainFoodGroup: targetGroups.dinner,
        recentPastaRecipeIds,
        weeklyPastaCount
      },
      allowPastaLimitFilter: !lunch || !isPastaOrCerealRecipe(lunch)
    });

    if (lunch) {
      usedRecipeIds.add(lunch.id);
      recentFoodGroups.push(lunch.mainFoodGroup);
      const ing = getMainIngredientId(lunch);
      if (ing) recentMainIngredientIds.push(ing);
      if (isPastaOrCerealRecipe(lunch)) {
        recentPastaRecipeIds.push(lunch.id);
        weeklyPastaCount += 1;
      }
    }

    const dinner = dinnerSelection.recipe;

    if (dinner) {
      usedRecipeIds.add(dinner.id);
      recentFoodGroups.push(dinner.mainFoodGroup);
      const ing = getMainIngredientId(dinner);
      if (ing) recentMainIngredientIds.push(ing);
      if (isPastaOrCerealRecipe(dinner)) {
        recentPastaRecipeIds.push(dinner.id);
        weeklyPastaCount += 1;
      }
    }

    while (recentFoodGroups.length > 4) recentFoodGroups.shift();
    while (recentMainIngredientIds.length > 3) recentMainIngredientIds.shift();
    while (recentPastaRecipeIds.length > 3) recentPastaRecipeIds.shift();

    const lunchSide = sideDishes[(dayIndex * 2) % Math.max(sideDishes.length, 1)];
    const dinnerSide = sideDishes[(dayIndex * 2 + 1) % Math.max(sideDishes.length, 1)];

    const lunchWarning = lunchSelection.warnings[0];
    const dinnerWarning = dinnerSelection.warnings[0];

    const lunchMeal = buildMeal("lunch", [lunch, lunchSide].filter(Boolean) as RecipeWithIngredients[], params.persons, dayIndex, isPresentAtMeal, isSportDay);
    const dinnerMeal = buildMeal("dinner", [dinner, dinnerSide].filter(Boolean) as RecipeWithIngredients[], params.persons, dayIndex, isPresentAtMeal, isSportDay);
    const dailyMeals = [
      lunchWarning ? { ...lunchMeal, warning: lunchWarning } : lunchMeal,
      dinnerWarning ? { ...dinnerMeal, warning: dinnerWarning } : dinnerMeal
    ];

    if (shouldGenerateBreakfast) {
      if (breakfastSnackMode === "recipes") {
        const breakfastRecipe = breakfastRecipes[dayIndex % Math.max(breakfastRecipes.length, 1)];
        if (breakfastRecipe) dailyMeals.unshift(buildMeal("breakfast", [breakfastRecipe], params.persons, dayIndex, isPresentAtMeal, isSportDay));
      } else {
        const recipeName = snackSuggestionPool.breakfast[dayIndex % snackSuggestionPool.breakfast.length];
        dailyMeals.unshift(buildSimpleSuggestionMeal("breakfast", recipeName, params.persons, dayIndex, isPresentAtMeal, isSportDay));
      }
    }

    if (shouldGenerateAfternoonSnack) {
      if (breakfastSnackMode === "recipes") {
        const recipePool = [...afternoonSnackRecipes, ...morningSnackRecipes];
        const snackRecipe = recipePool[dayIndex % Math.max(recipePool.length, 1)];
        if (snackRecipe) dailyMeals.push(buildMeal("afternoon_snack", [snackRecipe], params.persons, dayIndex, isPresentAtMeal, isSportDay));
      } else {
        const recipeName = snackSuggestionPool.afternoon_snack[dayIndex % snackSuggestionPool.afternoon_snack.length];
        dailyMeals.push(buildSimpleSuggestionMeal("afternoon_snack", recipeName, params.persons, dayIndex, isPresentAtMeal, isSportDay));
      }
    }

    return {
      day,
      meals: dailyMeals
    };
  });

  return {
    disclaimer:
      "Indicative estimate only. This menu is not medical advice and does not replace a nutrition professional.",
    meals: dailyMeals
  };
}

function buildMeal(mealType: MealType, selectedRecipes: RecipeWithIngredients[], persons: Person[], dayIndex: number, isPresentAtMeal: (personId: string, mealType: MealType, dayIndex: number) => boolean, isSportDay: (personId: string, dayIndex: number) => boolean) {
  const standardMealKcal = selectedRecipes.reduce((sum, recipe) => {
    const nutrition = recipe.nutritionPerStandardPortion as { kcal?: number };
    return sum + (nutrition.kcal ?? 0);
  }, 0);

  return {
    mealType,
    recipes: selectedRecipes.map((recipe) => recipe.name),
    portions: persons.filter((person) => isPresentAtMeal(person.id, mealType, dayIndex)).map((person) => {
      const sportBoost = isSportDay(person.id, dayIndex) ? 1.1 : 1;
      // MVP simplification: flat +10% on sport days, without duration/intensity modeling yet.
      const mealTargetKcal = estimateDailyCalories(person) * sportBoost * mealDistribution[mealType];
      // MVP simplification: cap multipliers rather than adding complex additions/substitutions.
      const multiplier = Math.max(0.6, Math.min(1.6, mealTargetKcal / Math.max(standardMealKcal, 1)));

      return {
        personId: person.id,
        personName: person.name,
        multiplier: Number(multiplier.toFixed(2)),
        portionLabel: getPortionLabel(multiplier),
        estimatedCalories: Math.round(standardMealKcal * multiplier),
        macroTargets: estimateMacroTargets(person)
      };
    })
  };
}


function buildSimpleSuggestionMeal(mealType: Extract<MealType, "breakfast" | "afternoon_snack">, suggestion: string, persons: Person[], dayIndex: number, isPresentAtMeal: (personId: string, mealType: MealType, dayIndex: number) => boolean, isSportDay: (personId: string, dayIndex: number) => boolean) {
  const baseCalories = mealType === "breakfast" ? 320 : 190;

  return {
    mealType,
    recipes: [suggestion],
    portions: persons.filter((person) => isPresentAtMeal(person.id, mealType, dayIndex)).map((person) => {
      const sportBoost = isSportDay(person.id, dayIndex) ? 1.1 : 1;
      // MVP simplification: flat +10% on sport days, without duration/intensity modeling yet.
      const mealTargetKcal = estimateDailyCalories(person) * sportBoost * mealDistribution[mealType];
      const multiplier = Math.max(0.6, Math.min(1.6, mealTargetKcal / Math.max(baseCalories, 1)));

      return {
        personId: person.id,
        personName: person.name,
        multiplier: Number(multiplier.toFixed(2)),
        portionLabel: getPortionLabel(multiplier),
        estimatedCalories: Math.round(baseCalories * multiplier),
        macroTargets: estimateMacroTargets(person)
      };
    })
  };
}
