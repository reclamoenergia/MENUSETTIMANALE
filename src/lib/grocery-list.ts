import { IngredientCategory, Prisma, Unit } from "@prisma/client";

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: { ingredients: { include: { ingredient: true } } } }>;

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

export type GroceryListItem = {
  ingredientId: string;
  ingredientName: string;
  category: GroceryCategory;
  roundedQuantity: number;
  displayQuantity: string;
};

const categoryOrder: GroceryCategory[] = [
  "vegetables",
  "fruit",
  "meat",
  "fish",
  "dairy",
  "legumes",
  "pasta_rice_cereals",
  "pantry",
  "condiments",
  "other"
];

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function formatRoundedQuantity(quantity: number, unit: Unit): { roundedQuantity: number; displayQuantity: string } {
  if (unit === "piece") {
    const rounded = Math.ceil(quantity);
    return { roundedQuantity: rounded, displayQuantity: `${rounded} pieces` };
  }

  if (unit === "g") {
    if (quantity < 100) {
      const rounded = roundToStep(quantity, 10);
      return { roundedQuantity: rounded, displayQuantity: `${rounded} g` };
    }

    if (quantity < 1000) {
      const rounded = roundToStep(quantity, 50);
      return { roundedQuantity: rounded, displayQuantity: `${rounded} g` };
    }

    const kg = roundToStep(quantity / 1000, 0.1);
    return { roundedQuantity: kg, displayQuantity: `${kg.toFixed(kg % 1 === 0 ? 0 : 1)} kg` };
  }

  if (unit === "ml") {
    if (quantity < 100) {
      const rounded = roundToStep(quantity, 10);
      return { roundedQuantity: rounded, displayQuantity: `${rounded} ml` };
    }

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
  switch (category) {
    case "vegetables":
      return "vegetables";
    case "fruit":
      return "fruit";
    case "meat":
      return "meat";
    case "fish":
      return "fish";
    case "dairy":
      return "dairy";
    case "legumes":
      return "legumes";
    case "pasta_rice_cereals":
      return "pasta_rice_cereals";
    case "pantry":
      return "pantry";
    case "condiments":
      return "condiments";
    default:
      return "other";
  }
}

export function generateGroceryList(params: {
  weeklyMenu: { meals: { recipes: string[]; portions: { multiplier: number }[] }[] }[];
  recipes: RecipeWithIngredients[];
}) {
  const recipesByName = new Map(params.recipes.map((recipe) => [recipe.name, recipe]));
  const aggregated = new Map<string, AggregatedIngredient>();

  for (const day of params.weeklyMenu) {
    for (const meal of day.meals) {
      const totalMultiplier = meal.portions.reduce((sum, portion) => sum + portion.multiplier, 0);

      for (const recipeName of meal.recipes) {
        const recipe = recipesByName.get(recipeName);
        if (!recipe) continue;

        for (const recipeIngredient of recipe.ingredients) {
          const key = `${recipeIngredient.ingredientId}:${recipeIngredient.unit}`;
          const existing = aggregated.get(key);
          const additionalQuantity = recipeIngredient.quantityPerStandardPortion * totalMultiplier;

          if (existing) {
            existing.quantity += additionalQuantity;
            continue;
          }

          aggregated.set(key, {
            ingredientId: recipeIngredient.ingredientId,
            ingredientName: recipeIngredient.ingredient.name,
            category: mapIngredientCategory(recipeIngredient.ingredient.category),
            unit: recipeIngredient.unit,
            quantity: additionalQuantity
          });
        }
      }
    }
  }

  const items: GroceryListItem[] = Array.from(aggregated.values()).map((item) => {
    const rounded = formatRoundedQuantity(item.quantity, item.unit);

    return {
      ingredientId: item.ingredientId,
      ingredientName: item.ingredientName,
      category: item.category,
      roundedQuantity: rounded.roundedQuantity,
      displayQuantity: rounded.displayQuantity
    };
  });

  const grouped = categoryOrder.map((category) => ({
    category,
    items: items
      .filter((item) => item.category === category)
      .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName))
  }));

  return {
    groups: grouped.filter((group) => group.items.length > 0),
    roundingExamples: {
      grams: {
        from780g: formatRoundedQuantity(780, "g").displayQuantity,
        from1230g: formatRoundedQuantity(1230, "g").displayQuantity
      },
      milliliters: {
        from65ml: formatRoundedQuantity(65, "ml").displayQuantity
      },
      pieces: {
        from2_2pieces: formatRoundedQuantity(2.2, "piece").displayQuantity
      }
    }
  };
}
