import { IngredientCategory, Prisma, Unit } from "@prisma/client";
import { buildRecipePortionIngredients } from "@/lib/recipe-ingredient-portions";

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
  weeklyMenu: { meals: { recipes: string[]; portions: { multiplier: number; assignedRecipeName?: string }[] }[] }[];
  recipes: RecipeWithIngredients[];
}) {
  const recipesByName = new Map(params.recipes.map((recipe) => [recipe.name, recipe]));
  const aggregated = new Map<string, AggregatedIngredient>();
  const missingIngredientsForRecipes = new Set<string>();

  for (const day of params.weeklyMenu) {
    for (const meal of day.meals) {
      const multipliersByRecipe = new Map<string, number>();
      for (const portion of meal.portions) {
        const recipeName = portion.assignedRecipeName ?? meal.recipes[0];
        if (!recipeName) continue;
        multipliersByRecipe.set(recipeName, (multipliersByRecipe.get(recipeName) ?? 0) + portion.multiplier);
      }

      for (const [recipeName, totalMultiplier] of multipliersByRecipe.entries()) {
        const recipe = recipesByName.get(recipeName);
        if (!recipe) continue;

        const scaledIngredients = buildRecipePortionIngredients({
          recipeName: recipe.name,
          ingredients: recipe.ingredients.map((recipeIngredient) => ({
            ingredientId: recipeIngredient.ingredientId,
            ingredientName: recipeIngredient.ingredient.name,
            quantityPerStandardPortion: recipeIngredient.quantityPerStandardPortion,
            unit: recipeIngredient.unit,
            category: recipeIngredient.ingredient.category
          })),
          multiplier: totalMultiplier,
          onMissingIngredients: (name) => missingIngredientsForRecipes.add(name)
        });

        for (const ingredient of scaledIngredients) {
          const key = `${ingredient.ingredientId}:${ingredient.unit}`;
          const existing = aggregated.get(key);

          if (existing) {
            existing.quantity += ingredient.quantity;
            continue;
          }

          aggregated.set(key, {
            ingredientId: ingredient.ingredientId,
            ingredientName: ingredient.ingredientName,
            category: mapIngredientCategory(ingredient.category ?? "other"),
            unit: ingredient.unit,
            quantity: ingredient.quantity
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
    warnings:
      missingIngredientsForRecipes.size > 0
        ? [`Missing RecipeIngredient seed data for recipes: ${Array.from(missingIngredientsForRecipes).sort().join(", ")}`]
        : []
  };
}
