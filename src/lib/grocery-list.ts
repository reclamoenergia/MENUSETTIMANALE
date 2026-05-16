import { IngredientCategory, Prisma, Unit } from "@prisma/client";
import { buildRecipePortionIngredients } from "@/lib/recipe-ingredient-portions";

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: { ingredients: { include: { ingredient: true } } } }>;
type IngredientInfo = { ingredientId: string; ingredientName: string; category: GroceryCategory; unit: Unit };

type GroceryCategory =
  | "vegetables"
  | "fruit"
  | "meat"
  | "fish"
  | "dairy"
  | "legumes"
  | "pasta_rice_cereals"
  | "pantry"
  | "condiments"
  | "other";

type AggregatedIngredient = {
  ingredientId: string;
  ingredientName: string;
  category: GroceryCategory;
  unit: Unit;
  quantity: number;
};

type GroceryDebugSource = { day: string; mealType: string; personName: string; recipeName: string; quantity: number; unit: Unit };

export type GroceryListItem = {
  ingredientId: string;
  ingredientName: string;
  category: GroceryCategory;
  roundedQuantity: number;
  displayQuantity: string;
};

const categoryOrder: GroceryCategory[] = ["vegetables", "fruit", "meat", "fish", "dairy", "legumes", "pasta_rice_cereals", "pantry", "condiments", "other"];

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function formatRoundedQuantity(quantity: number, unit: Unit): { roundedQuantity: number; displayQuantity: string } {
  if (unit === "piece") {
    const rounded = Math.ceil(quantity);
    return { roundedQuantity: rounded, displayQuantity: `${rounded} pieces` };
  }

  if (unit === "g") {
    if (quantity < 1000) {
      const rounded = roundToStep(quantity, 50);
      return { roundedQuantity: rounded, displayQuantity: `${rounded} g` };
    }
    const kg = roundToStep(quantity / 1000, 0.1);
    return { roundedQuantity: kg, displayQuantity: `${kg.toFixed(kg % 1 === 0 ? 0 : 1)} kg` };
  }

  if (unit === "ml") {
    if (quantity < 1000) {
      const rounded = roundToStep(quantity, 50);
      return { roundedQuantity: rounded, displayQuantity: `${rounded} ml` };
    }
    const liters = roundToStep(quantity / 1000, 0.1);
    return { roundedQuantity: liters, displayQuantity: `${liters.toFixed(liters % 1 === 0 ? 0 : 1)} l` };
  }

  const rounded = roundToStep(quantity, 1);
  return { roundedQuantity: rounded, displayQuantity: `${rounded} ${unit}` };
}

function mapIngredientCategory(category: IngredientCategory): GroceryCategory {
  return categoryOrder.includes(category as GroceryCategory) ? (category as GroceryCategory) : "other";
}

function getIngredientInfo(
  recipeIngredient: {
    ingredientId: string;
    unit: Unit;
    ingredient?: { id?: string; name?: string; category?: IngredientCategory | GroceryCategory | null } | null;
    ingredientName?: string;
    category?: IngredientCategory | GroceryCategory;
  },
  ingredientMap: Map<string, { name: string; category: GroceryCategory }>
): IngredientInfo {
  const nestedIngredient = recipeIngredient.ingredient;
  const mappedIngredient = ingredientMap.get(recipeIngredient.ingredientId);

  if (!nestedIngredient && !mappedIngredient) {
    console.warn(`Missing ingredient relation for ingredientId: ${recipeIngredient.ingredientId}`);
  }

  const category = nestedIngredient?.category
    ? mapIngredientCategory(nestedIngredient.category as IngredientCategory)
    : recipeIngredient.category
      ? mapIngredientCategory(recipeIngredient.category as IngredientCategory)
      : (mappedIngredient?.category ?? "other");

  return {
    ingredientId: recipeIngredient.ingredientId,
    ingredientName:
      nestedIngredient?.name ?? recipeIngredient.ingredientName ?? mappedIngredient?.name ?? recipeIngredient.ingredientId,
    category,
    unit: recipeIngredient.unit
  };
}

export function generateGroceryList(params: {
  weeklyMenu: { day?: string; meals: { mealType: string; slot?: number; recipes: string[]; portions: { personName?: string; multiplier: number; assignedRecipeName?: string }[] }[] }[];
  recipes: RecipeWithIngredients[];
  includeDebugTrace?: boolean;
}) {
  const recipesByName = new Map(params.recipes.map((recipe) => [recipe.name, recipe]));
  const ingredientMap = new Map<string, { name: string; category: GroceryCategory }>();
  for (const recipe of params.recipes) {
    for (const recipeIngredient of recipe.ingredients) {
      const ingredientInfo = getIngredientInfo(recipeIngredient, ingredientMap);
      ingredientMap.set(ingredientInfo.ingredientId, { name: ingredientInfo.ingredientName, category: ingredientInfo.category });
    }
  }
  const aggregated = new Map<string, AggregatedIngredient>();
  const missingIngredientsForRecipes = new Set<string>();
  const debugTrace = new Map<string, GroceryDebugSource[]>();

  for (const day of params.weeklyMenu) {
    for (const meal of day.meals) {
      for (const portion of meal.portions) {
        if (portion.multiplier <= 0) continue;
        const recipeName = portion.assignedRecipeName ?? meal.recipes[0];
        if (!recipeName) continue;
        const recipe = recipesByName.get(recipeName);
        if (!recipe) continue;

        const scaledIngredients = buildRecipePortionIngredients({
          recipeName: recipe.name,
          ingredients: recipe.ingredients.map((recipeIngredient) => {
            const ingredientInfo = getIngredientInfo(recipeIngredient, ingredientMap);
            return {
              ...ingredientInfo,
              quantityPerStandardPortion: recipeIngredient.quantityPerStandardPortion,
              category: ingredientInfo.category
            };
          }),
          multiplier: portion.multiplier,
          onMissingIngredients: (name) => missingIngredientsForRecipes.add(name)
        });

        for (const ingredient of scaledIngredients) {
          const key = `${ingredient.ingredientId}:${ingredient.unit}`;
          const existing = aggregated.get(key);
          if (existing) existing.quantity += ingredient.quantity;
          else aggregated.set(key, { ingredientId: ingredient.ingredientId, ingredientName: ingredient.ingredientName, category: mapIngredientCategory(ingredient.category ?? "other"), unit: ingredient.unit, quantity: ingredient.quantity });

          if (params.includeDebugTrace) {
            const trace = debugTrace.get(key) ?? [];
            trace.push({ day: day.day ?? "", mealType: meal.mealType, personName: portion.personName ?? "famiglia", recipeName, quantity: ingredient.quantity, unit: ingredient.unit });
            debugTrace.set(key, trace);
          }
        }
      }
    }
  }

  const items: GroceryListItem[] = Array.from(aggregated.values()).map((item) => {
    const rounded = formatRoundedQuantity(item.quantity, item.unit);
    return { ingredientId: item.ingredientId, ingredientName: item.ingredientName, category: item.category, roundedQuantity: rounded.roundedQuantity, displayQuantity: rounded.displayQuantity };
  });

  return {
    groups: categoryOrder.map((category) => ({ category, items: items.filter((item) => item.category === category).sort((a, b) => a.ingredientName.localeCompare(b.ingredientName)) })).filter((group) => group.items.length > 0),
    warnings: missingIngredientsForRecipes.size > 0 ? [`Missing RecipeIngredient seed data for recipes: ${Array.from(missingIngredientsForRecipes).sort().join(", ")}`] : [],
    debugTrace: params.includeDebugTrace ? Object.fromEntries(debugTrace.entries()) : undefined
  };
}
