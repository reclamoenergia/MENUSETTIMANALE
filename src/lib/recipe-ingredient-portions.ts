import { IngredientCategory, Unit } from "@prisma/client";

export type PortionIngredient = {
  ingredientId: string;
  ingredientName: string;
  unit: Unit;
  quantity: number;
  category?: IngredientCategory;
};

export type RecipeIngredientInput = {
  ingredientId: string;
  ingredientName: string;
  quantityPerStandardPortion: number;
  unit: Unit;
  category?: IngredientCategory;
};

export function buildRecipePortionIngredients(params: {
  recipeName: string;
  ingredients: RecipeIngredientInput[];
  multiplier: number;
  onMissingIngredients?: (recipeName: string) => void;
}): PortionIngredient[] {
  if (params.ingredients.length === 0) {
    params.onMissingIngredients?.(params.recipeName);
    return [];
  }

  return params.ingredients.map((ingredient) => ({
    ingredientId: ingredient.ingredientId,
    ingredientName: ingredient.ingredientName,
    unit: ingredient.unit,
    category: ingredient.category,
    quantity: ingredient.quantityPerStandardPortion * params.multiplier
  }));
}
