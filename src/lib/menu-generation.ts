import { ActivityLevel, Goal, MealType, Person, Prisma, RecipeMealCategory, Sex } from "@prisma/client";

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

export function estimateDailyCalories(person: Person): number {
  const baseBmr =
    10 * person.weightKg +
    6.25 * person.heightCm -
    5 * person.age +
    (person.sex === Sex.male ? 5 : -161);

  return baseBmr * activityFactors[person.activityLevel] * goalAdjustments[person.goal];
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

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function generateWeeklyMenu(params: {
  persons: Person[];
  recipes: RecipeWithIngredients[];
  weekNumber: number;
  allowFrozenFood: boolean;
}) {
  const excludedFoodIds = [...new Set(params.persons.flatMap((p) => p.excludedFoodIds))];

  const meals = dayNames.map((day, dayIndex) => {
    const lunchRecipes = filterRecipes(params.recipes, {
      mealCategory: "lunch",
      excludedFoodIds,
      maxPrepMinutes: 45,
      mustBePreppableDayBefore: dayIndex < 5,
      allowFrozenFood: params.allowFrozenFood,
      weekNumber: params.weekNumber
    });

    const dinnerRecipes = filterRecipes(params.recipes, {
      mealCategory: "dinner",
      excludedFoodIds,
      maxPrepMinutes: 45,
      mustBePreppableDayBefore: false,
      allowFrozenFood: params.allowFrozenFood,
      weekNumber: params.weekNumber
    });

    const sideDishes = filterRecipes(params.recipes, {
      mealCategory: "side_dish",
      excludedFoodIds,
      maxPrepMinutes: 30,
      mustBePreppableDayBefore: false,
      allowFrozenFood: params.allowFrozenFood,
      weekNumber: params.weekNumber
    });

    const lunch = lunchRecipes[dayIndex % Math.max(lunchRecipes.length, 1)];
    const dinner = dinnerRecipes[(dayIndex + 2) % Math.max(dinnerRecipes.length, 1)];
    const lunchSide = sideDishes[dayIndex % Math.max(sideDishes.length, 1)];
    const dinnerSide = sideDishes[(dayIndex + 3) % Math.max(sideDishes.length, 1)];

    return {
      day,
      meals: [
        buildMeal("lunch", [lunch, lunchSide].filter(Boolean) as RecipeWithIngredients[], params.persons),
        buildMeal("dinner", [dinner, dinnerSide].filter(Boolean) as RecipeWithIngredients[], params.persons)
      ]
    };
  });

  return {
    disclaimer:
      "Indicative estimate only. This menu is not medical advice and does not replace a nutrition professional.",
    meals
  };
}

function buildMeal(mealType: MealType, selectedRecipes: RecipeWithIngredients[], persons: Person[]) {
  const standardMealKcal = selectedRecipes.reduce((sum, recipe) => {
    const nutrition = recipe.nutritionPerStandardPortion as { kcal?: number };
    return sum + (nutrition.kcal ?? 0);
  }, 0);

  return {
    mealType,
    recipes: selectedRecipes.map((recipe) => recipe.name),
    portions: persons.map((person) => {
      const mealTargetKcal = estimateDailyCalories(person) * mealDistribution[mealType];
      // MVP simplification: cap multipliers rather than adding complex additions/substitutions.
      const multiplier = Math.max(0.6, Math.min(1.6, mealTargetKcal / Math.max(standardMealKcal, 1)));

      return {
        personId: person.id,
        personName: person.name,
        multiplier: Number(multiplier.toFixed(2)),
        estimatedCalories: Math.round(mealTargetKcal),
        macroTargets: estimateMacroTargets(person)
      };
    })
  };
}
