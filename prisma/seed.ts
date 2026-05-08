import { IngredientCategory, PrismaClient } from "@prisma/client";
import { ingredients } from "./seed-data/ingredients";
import { recipes } from "./seed-data/recipes";

const prisma = new PrismaClient();

function validateSeedData(): void {
  const ingredientIds = new Set(ingredients.map((i) => i.id));

  for (const recipe of recipes) {
    if (recipe.ingredients.length === 0) {
      throw new Error(`Recipe ${recipe.id} (${recipe.name}) has no ingredients.`);
    }

    if (!recipe.nutritionPerStandardPortion) {
      throw new Error(`Recipe ${recipe.id} (${recipe.name}) has no nutrition data.`);
    }

    const seen = new Set<string>();
    for (const ri of recipe.ingredients) {
      if (!ingredientIds.has(ri.ingredientId)) {
        throw new Error(`Recipe ${recipe.id} (${recipe.name}) references missing ingredient ${ri.ingredientId}.`);
      }
      if (seen.has(ri.ingredientId)) {
        throw new Error(`Recipe ${recipe.id} (${recipe.name}) contains duplicate ingredient ${ri.ingredientId}.`);
      }
      seen.add(ri.ingredientId);
    }

    const lowName = recipe.name.toLowerCase();
    for (const ri of recipe.ingredients) {
      const token = ri.ingredientId.split("_")[0];
      if (["pasta", "riso", "pollo", "tonno", "uova", "yogurt"].includes(token) && !lowName.includes(token)) {
        console.warn(`[seed:warning] Possible mismatch: ${recipe.name} includes ${ri.ingredientId}`);
      }
    }
  }

  for (const ingredient of ingredients) {
    if (["fruit", "vegetables"].includes(ingredient.category as IngredientCategory) && ingredient.seasonWeeks.length === 0) {
      throw new Error(`Ingredient ${ingredient.id} (${ingredient.name}) is fruit/vegetable and has no season weeks.`);
    }
  }
}

async function main() {
  validateSeedData();

  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({ where: { id: ingredient.id }, update: ingredient, create: ingredient });
  }

  for (const recipe of recipes) {
    const saved = await prisma.recipe.upsert({
      where: { name: recipe.name },
      update: {
        mealCategories: recipe.mealCategories,
        recipeTags: recipe.recipeTags,
        regionalTags: recipe.regionalTags,
        mainFoodGroup: recipe.mainFoodGroup,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        canBePreparedDayBefore: recipe.canBePreparedDayBefore,
        suitableForChildren: recipe.suitableForChildren,
        isSideDish: recipe.isSideDish,
        nutritionPerStandardPortion: recipe.nutritionPerStandardPortion,
        steps: recipe.steps
      },
      create: {
        id: recipe.id,
        name: recipe.name,
        mealCategories: recipe.mealCategories,
        recipeTags: recipe.recipeTags,
        regionalTags: recipe.regionalTags,
        mainFoodGroup: recipe.mainFoodGroup,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        canBePreparedDayBefore: recipe.canBePreparedDayBefore,
        suitableForChildren: recipe.suitableForChildren,
        isSideDish: recipe.isSideDish,
        nutritionPerStandardPortion: recipe.nutritionPerStandardPortion,
        steps: recipe.steps
      }
    });

    await prisma.recipeIngredient.deleteMany({ where: { recipeId: saved.id } });
    await prisma.recipeIngredient.createMany({
      data: recipe.ingredients.map((ri) => ({
        recipeId: saved.id,
        ingredientId: ri.ingredientId,
        quantityPerStandardPortion: ri.quantity,
        unit: ri.unit
      }))
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
