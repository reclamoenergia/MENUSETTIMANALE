import { z } from "zod";
import { IngredientCategory, MainFoodGroup, RecipeMealCategory, RecipeTag, StorageType, Unit } from "@prisma/client";

const nutritionSchema = z.object({
  kcal: z.coerce.number().min(0),
  proteinG: z.coerce.number().min(0),
  carbsG: z.coerce.number().min(0),
  fatG: z.coerce.number().min(0),
  sugarsG: z.coerce.number().min(0)
});

export const recipePayloadSchema = z.object({
  name: z.string().min(1),
  mealCategories: z.array(z.nativeEnum(RecipeMealCategory)).min(1),
  recipeTags: z.array(z.nativeEnum(RecipeTag)),
  regionalTags: z.array(z.string()),
  mainFoodGroup: z.nativeEnum(MainFoodGroup),
  prepTimeMinutes: z.coerce.number().int().min(0),
  cookTimeMinutes: z.coerce.number().int().min(0),
  canBePreparedDayBefore: z.boolean(),
  suitableForChildren: z.boolean(),
  isSideDish: z.boolean(),
  nutritionPerStandardPortion: nutritionSchema,
  steps: z.array(z.string().min(1)),
  ingredients: z.array(
    z.object({
      ingredientId: z.string().min(1),
      quantityPerStandardPortion: z.coerce.number().positive(),
      unit: z.nativeEnum(Unit)
    })
  ).min(1)
});

export const ingredientPayloadSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  category: z.nativeEnum(IngredientCategory),
  storageType: z.nativeEnum(StorageType),
  shelfLifeDays: z.coerce.number().int().min(0),
  recommendedPurchaseLeadDays: z.coerce.number().int().min(0),
  isSeasonal: z.boolean(),
  seasonWeeks: z.array(z.coerce.number().int().min(1).max(52)),
  hasFrozenOption: z.boolean()
});

export function parseSeasonWeeks(input: string): number[] {
  if (!input.trim()) return [];
  return input
    .split(",")
    .map((chunk) => Number(chunk.trim()))
    .filter((value) => Number.isFinite(value));
}
